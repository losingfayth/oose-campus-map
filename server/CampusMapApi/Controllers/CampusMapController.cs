using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Neo4j.Driver; // DB related functions
using CampusMapApi.Utilities;
using CampusMapApi.Services;
using CampusMapApi.Models;

namespace CampusMapApi.Controllers;

/// <summary>
/// Establishes a web API controller to handle server-side requests from the 
/// front end
/// 
/// </summary>
/// <param name="logger">Logger running for reporting and errors</param>
/// <param name="neo4jService">Service to access database</param>

[ApiController] // marks this class as a web API controller
[Route("api/[controller]")] // define URL route for controller
public class CampusMapController(
	ILogger<CampusMapController> logger, 
	Neo4jService neo4jService) : ControllerBase {

	private readonly Neo4jService _neo4j = neo4jService;

	private readonly ILogger<CampusMapController> _logger = logger;

	/// <summary>
	/// Queries the database for the shortest path between two points using 
	/// A* GDS plugin
	/// HttpPost request that recieves a JSON object containing two database 
	/// node ids for a starting location and End. Runs a query that 
	/// finds the shortest path between two points. Returns a list of lists. 
	/// Internal lists are length 2 and contain the latitude and longitude 
	/// associated with each node along the shortest path.
	/// </summary>
	/// <param name="request">The start and end location node ids</param>
	/// <returns>A list of location nodes</returns>
	/// <exception cref="InvalidOperationException"></exception>
	[HttpPost("FindPath")]
	public async Task<IActionResult> FindPath([FromBody] PathRequest request)
	{

		int start = request.Start; // get starting node id
		int end = request.End; // get End node id

		// initial db connection
		var uri = "neo4j+s://apibloomap.xyz:7687";
		var username = Environment.GetEnvironmentVariable("DB_USER")
			?? throw new InvalidOperationException("DB_USER is not set");
		var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
			?? throw new InvalidOperationException("DB_PASSWORD is not set");
		IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));

		await using var session = _driver.AsyncSession();


		try {
			// drop existing graph projection
			var dropProjection = @"
			CALL gds.graph.drop('campusGraph', false);";

			//await session.RunAsync(dropProjection);

			await _neo4j.ExecuteWriteQueryAsync(dropProjection);

			// create new graph projection
			var createProjection = @"
			CALL gds.graph.project(
				'campusGraph', {
					Location: {
						properties: ['latitude', 'longitude']
					}
				} , {
					CONNECTED_TO: {
					type: 'CONNECTED_TO',
					properties: 'distance'
					}
				})";


			// run prjection creation query
			//await session.RunAsync(createProjection);

			await _neo4j.ExecuteWriteQueryAsync(createProjection);

			// query to use A* algorithm on database
			var query = @"
				MATCH (startNode:Location {id: $start})
				MATCH (endNode:Location {id: $end})
				WHERE endNode.isValidDestination = true

				WITH id(startNode) AS startId, id(endNode) AS endId

				CALL {
					WITH startId, endId
					CALL gds.shortestPath.astar.stream('campusGraph', {
						sourceNode: startId,
						targetNode: endId,
						relationshipWeightProperty: 'distance',
						latitudeProperty: 'latitude',
						longitudeProperty: 'longitude'
					})
					YIELD nodeIds, totalCost
					RETURN nodeIds, totalCost
				}

				UNWIND nodeIds AS nodeId
				MATCH (n) WHERE id(n) = nodeId
				OPTIONAL MATCH (n)-[:IS_IN]->(a:Area)
				RETURN 
					n.latitude AS latitude, 
					n.longitude AS longitude,
					n.floor AS floor,
					n.id AS id,
					a.name AS building
				";

			// run the above query on the database with the provided starting and ending ids, then put it into a list
			//var result = await session.RunAsync(query, new { start, End });
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { start, end } );

			var path = new List<List<PathNodeDto>>(); // list of lists for node data
			bool firstPass = true; // flags if it is first pass-through records
			string currArea = ""; // tracking variable to store current area nodes are in
			float currFloor = 0; // tracking variable to store current floor nodes are in
			int i = -1; // iterator var

			// iterate over the list of nodes, getting each lat and long value and adding
			// it to the path List<>
			foreach (var record in results)
			{
				// initialize records from node
				var latitude = record["latitude"].ToString() ?? "";
				var longitude = record["longitude"].ToString() ?? "";
				var floor = record["floor"].ToString() ?? "";
				var id = record["id"].ToString() ?? "";
				var area = record["building"].ToString() ?? "";

				var floorFloat = float.Parse(floor);
				// check if this is the first pass-through the records. if so, initialize
				// what area and building we are starting in

				// check if the area and floor of the current node matches those of the
				// prvious one. if not, increment the index of path
				if (firstPass 
					|| currArea != area 
					|| (currFloor != floorFloat 
						&& Math.Abs(currFloor - floorFloat) > .5))
				{
					path.Add([]);
					i++;
					currArea = area;
					currFloor = floorFloat;
					firstPass = false;
				}

					// add a new node at the correct index
					path[i].Add(new PathNodeDto
					{
						Latitude = float.Parse(latitude),
						Longitude = float.Parse(longitude),
						Floor = float.Parse(floor),
						Building = area,
						Id = id
					});
				}

			// check if a path was found and return it if it was
			if (path.Count > 0) return Ok(new { message = "Path found!", path });
			else return Ok(new { message = "No Path Found!" });

		}
		catch (Exception e)
		{
			Console.WriteLine($"Error: { e.Message }");
			return StatusCode(500, new { error = e.Message });
		}
	}
	
	/// <summary>
	/// Queries database for all nodes and returns a list of building names.
	/// http GET api endpoint accessible at GET /api/CampusMap/GetBuildings
	/// 
	/// When called, does a DB query to Neo4j to retrieve building name, room 
	/// number, and unique id of every node for every room on campus. Returns 
	/// an IActionResult object that indicates the status of request 
	/// completeion (400/404 bad, 200 good), and an List<> of LocationNode 
	/// objects. Each node contains the previously queried data about each 
	/// location on campus.
	/// </summary>
	/// <returns>A list of Building objects</returns>
	[HttpGet("GetBuildings")]
	public async Task<IActionResult> GetBuildings()
	{
		// query to retrieve all nodes' building and room number attributes
		var query = @"
					MATCH (a:Area)
					WHERE a.name <> 'Outside'
					RETURN a.name AS name
				";

		var buildings = new List<BuildingDto>(); // list of locations being queried

		try {
			// run the query on the database at store result set						
			var results = await _neo4j.ExecuteReadQueryAsync(query);

			// get the key attributes from each record and create a location 
			// node with those attributes. add the node to the list
			results.ForEach(record =>
			{
				BuildingDto node = new() { Name = record["name"].As<string>() };
				buildings.Add(node);
			});

		}
		catch (Exception e) { Console.WriteLine($"Error: {e.Message}"); }

		// return the list of location nodes and the status of the call
		return Ok(buildings);
	}

	/// <summary>
	/// Queries database for all rooms withing a building and returns a
	/// list of location objects.
	/// 
	/// Http POST api endpoint accessible at GET api CampusMap/GetRooms
	/// HttpPut request that recieves a JSON object containing a string that 
	/// defines the name of a building in the database. Queries for all valid 
	/// destinations inside that buidling and adds them to a list
	/// </summary>
	/// <param name="BuildingRequest">The building the rooms are in</param>
	/// <returns>A list of location objects</returns>
	[HttpPost("GetRooms")]
	public async Task<IActionResult> GetRooms([FromBody] BuildingRequest request)
	{
		var building = request.Building;

		// query to get every room in a building from database
		var query = @"
			MATCH (a:Area {name: $building})<-[:IS_IN]-(l:Location)
			WHERE l.isValidDestination = TRUE
			RETURN a.name AS building, l.name AS name, l.id AS id
		";

		// list to hold locations
		var rooms = new List<RoomDto>();

		try {
			// run the building query
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { building });

			results.ForEach(record => {
				RoomDto room = new()
				{
					Building = record["building"].As<string>(),
					Name = record["name"].As<string>(),
					Id = record["id"].As<string>()
				};

				rooms.Add(room);
			});
		}
		catch (Exception e) { Console.WriteLine($"Error: { e.Message }"); }

		return Ok(rooms);
	}

	/// <summary>
	/// Retrieves all the PointsOfInterest stored in the database
	/// </summary>
	/// <returns>A list of PointOfInterests</returns>
	[HttpGet("GetPois")]
	public async Task<IActionResult> GetPois()
	{
		const string query = @"
			MATCH (poi:PointOfInterest)
			MATCH (loc:Location) WHERE (poi)-[:LOCATED_AT]->(loc)
			MATCH (bldg:Area) WHERE (loc)-[:IS_IN]->(bldg)
			MATCH (cat:PointOfInterestCategory) WHERE (poi)-[:IN_CATEGORY]->(cat)
			RETURN poi.name AS name, poi.abbreviation AS abbr, cat.name AS cat, loc.id AS locId, loc.name AS room, bldg.name AS bldg
		";

		var results = await _neo4j.ExecuteReadQueryAsync(query);

		List<PointOfInterest> pois = [];

		results.ForEach(record => {
			PointOfInterest poi = new()
			{
				Name = record["name"].As<string>(),
				Abbreviation = record["abbr"].As<string>(),
				Category = Enum.Parse<PointOfInterestCategory>(record["cat"].As<string>()),
				Room = record["room"].As<string>(),
				Building = record["bldg"].As<string>(),
				LocationId = record["locId"].As<int>()
			};

			pois.Add(poi);
		});

		return Ok(pois);
	}

	[HttpPost("GetFloors")]
	public async Task<IActionResult> GetFloors([FromBody] BuildingRequest request)
	{
		var building = request.Building;

		// query to get the number of floors and lowest floor 
		// given a building in the database
		var query = @"
			MATCH (a:Area {name: $building})<-[:IS_IN]-(l:Location)
			RETURN a.lowestFloor AS lowestFloor, a.numFloor AS numFlor
		";

		FloorDto floors = new FloorDto();
		var lowestFloor = "";
		var numFloor = "";

		try {
			// run the floor retrieval query
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { building });

			results.ForEach(record => {
				floors.LowestFloor = record["lowestFloor"].As<int>();
				floors.NumFloor = record["numFloor"].As<int>();
			});

			floors.LowestFloor = int.Parse(lowestFloor);
			floors.NumFloor = int.Parse(numFloor);
		}
		catch (Exception e) { Console.WriteLine($"Error: { e.Message }"); }

		return Ok(floors);
	}

/*
	[HttpPost("GetNearestNode")]
	public async Task<IActionResult> GetNearestNode([FromBody] BuildingRequest request)
	{
		var building = request.Building;

		// query to get the number of floors and lowest floor 
		// given a building in the database
		var query = @"
			MATCH (a:Area {name: $building})<-[:IS_IN]-(l:Location)
			RETURN a.lowestFloor AS lowestFloor, a.numFloor AS numFlor
		";

		FloorDto floors = new FloorDto();

		try {
			// run the floor retrieval query
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { building });
			var lowestFloor;
			var numFloor;

			results.ForEach(record => {
				lowestFloor = record["lowestFloor"].ToString ?? "";
				numFloor = record["numFloor"].ToString ?? "";
			});

			floors.LowestFloor = int.Parse(lowestFloor);
			floors.NumFloor = int.Parse(numFloor);
		}
		catch (Exception e) { Console.WriteLine($"Error: { e.Message }"); }

		return Ok(floors);
	}
	*/

	// DTO for request body
	public class BuildingRequest
	{
		public string Building { get; set; } = string.Empty;
	}

	public class PathRequest
	{
		public int Start { get; set; }
		public int End { get; set; }
	}
}


