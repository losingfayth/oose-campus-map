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
	Neo4jService neo4jService) : ControllerBase
{

	private readonly Neo4jService _neo4j = neo4jService;

	private readonly ILogger<CampusMapController> _logger = logger;

	[HttpPost("GetClosestLocation")]
	public async Task<IActionResult> GetClosestLocation([FromBody] LocationRequest request)
	{

		var building = request.Building; // get building name
		string floor = request.Floor.ToString(); // get floor number
		var latitude = request.Latitude; // get latitude
		var longitude = request.Longitude; // get longitude

		Console.WriteLine("Entering function: " + building + ", " + floor + ", " + latitude + ", " + longitude);

		// query to get every room in a building from database
		var query = @"
			MATCH (a:Area {name: $building}) <-[:IS_IN] - (l:Location)
			WHERE l.floor = " + floor +
			" RETURN l.latitude as lat, l.longitude as lng, l.id as id"
		;

		// list to hold locations
		var rooms = new List<LocationDto>();
		int closestId = -1;
		int currId = 0;
		float minDistance = 10000;
		float currDistance;
		try
		{
			// run the building query
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { building });

			results.ForEach(record =>
			{
				LocationDto n = new()
				{
					Latitude = record["lat"].As<float>(),
					Longitude = record["lng"].As<float>(),
					Id = record["id"].As<string>()
				};

				currDistance = (float)Math.Sqrt((n.Latitude - latitude) * (n.Latitude - latitude) + (n.Longitude - longitude) * (n.Longitude - longitude));
				if (currDistance < minDistance)
				{
					minDistance = currDistance;
					closestId = currId;
				}

				rooms.Add(n);
				currId++;
			});

			LocationDto closest = rooms[closestId];
			Console.WriteLine("Done: Closest: " + closest.Id);
			return Ok(closest.Id);

		}
		catch (Exception e)
		{
			Console.WriteLine($"Error: {e.Message}");
			return StatusCode(500, new { error = e.Message });
		}



	}


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
		var graphType = request.Accessible ? "accessibleCampusGraph" : "campusGraph";


		try
		{
			await DbProjectionGenerator.GenerateProjection(_neo4j, request.Accessible);

			// query to use A* algorithm on database
			var query = @"
				MATCH (startNode:Location {id: $start})
				MATCH (endNode:Location {id: $end})
				WHERE endNode.isValidDestination = 1

				WITH id(startNode) AS startId, id(endNode) AS endId

				CALL {
					WITH startId, endId
					CALL gds.shortestPath.astar.stream($graph, {
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
					a.name AS building,
					n.name AS locationName
				";

			// run the above query on the database with the provided starting and ending ids, then put it into a list
			//var result = await session.RunAsync(query, new { start, End });
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { start, end, graph = graphType });

			var path = new List<List<PathNodeDto>>();

			int i = 0;

			while (i < results.Count)
			{
				var startingRecord = results[i];
				var subpathFloor = Math.Floor(double.Parse(startingRecord["floor"].ToString() ?? ""));
				var subpathArea = startingRecord["building"].ToString() ?? "";

				List<PathNodeDto> subPath = [];
				var peek = results[i];
				var record = results[i];

				do
				{
					record = results[i];
					subPath.Add(new PathNodeDto
					{
						Latitude = float.Parse(record["latitude"].ToString() ?? ""),
						Longitude = float.Parse(record["longitude"].ToString() ?? ""),
						Floor = float.Parse(record["floor"].ToString() ?? ""),
						Building = record["building"].ToString() ?? "",
						Id = record["id"].ToString() ?? "",
					});

					i++;
					if (i >= results.Count)
					{
						path.Add(subPath);
						break;
					}
					peek = results[i];
					double peekFloor = Math.Floor(double.Parse(peek["floor"].ToString() ?? ""));
					string peekArea = record["building"].ToString() ?? "";
					if (peekFloor != subpathFloor || !peekArea.Equals(subpathArea))
					{
						path.Add(subPath);
						break;
					}
				} while (true);
			}


			// check if a path was found and return it if it was
			if (path.Count > 0) return Ok(new { message = "Path found!", path });
			else return Ok(new { message = "No Path Found!" });



		}
		catch (Exception e)
		{
			Console.WriteLine($"Error: {e.Message}");
			return StatusCode(500, new
			{
				error = e.Message
			});
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

		try
		{
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
			WHERE l.isValidDestination = 1
			RETURN a.name AS building, l.name AS name, l.id AS id
		";

		// list to hold locations
		var rooms = new List<RoomDto>();

		try
		{
			// run the building query
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { building });

			results.ForEach(record =>
			{
				RoomDto room = new()
				{
					Building = record["building"].As<string>(),
					Name = record["name"].As<string>(),
					Id = record["id"].As<string>()
				};

				rooms.Add(room);
			});
		}
		catch (Exception e) { Console.WriteLine($"Error: {e.Message}"); }

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

		results.ForEach(record =>
		{
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
			RETURN a.lowestFloor AS lowestFloor, a.numFloors AS numFloors
		";

		FloorDto floors = new FloorDto();
		var lowestFloor = "";
		var numFloors = "";

		try
		{
			// run the floor retrieval query
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { building });

			results.ForEach(record =>
			{
				floors.LowestFloor = record["lowestFloor"].As<int>();
				floors.NumFloors = record["numFloors"].As<int>();
			});
		}
		catch (Exception e) { Console.WriteLine($"Error: {e.Message}"); }

		return Ok(floors);
	}

	[HttpPost("GetNearestBathroom")]
	public async Task<IActionResult> GetNearestBathroom([FromBody] BathroomRequest request)
	{
		char gender = Char.ToUpper(request.Gender);

		var aGenderQuery = @"
			MATCH (aGender:BathroomType {name: 'All'})
		";

		var fGenderQuery = @"
			MATCH (fGender:BathroomType {name: 'Women'})
		";
		var fTypeQuery = @"
			OR (bathrooms)-[:IS_TYPE]->(fGender)
		";

		var mGenderQuery = @"
			MATCH (mGender:BathroomType {name: 'Men'})
		";
		var mTypeQuery = @"
			OR (bathrooms)-[:IS_TYPE]->(mGender)
		";

		var query = @"
			MATCH (cat:LocationCategory {name: 'Bathroom'})"
			+ aGenderQuery
			+ (gender == 'F' || gender == 'N' ? fGenderQuery : @"")
			+ (gender == 'M' || gender == 'N' ? mGenderQuery : @"")
			+ @"MATCH (bathrooms:Location)
				WHERE (bathrooms)-[:IN_CATEGORY]->(cat)
				AND ((bathrooms)-[:IS_TYPE]->(aGender)"
			+ (gender == 'F' || gender == 'N' ? fTypeQuery : @"")
			+ (gender == 'M' || gender == 'N' ? mTypeQuery : @"")
			+ @")
			MATCH (source:Location {id: $startId})
			CALL gds.shortestPath.dijkstra.stream(
				'campusGraph',
				{
					sourceNode: source,
					targetNode: bathrooms,
					relationshipWeightProperty: 'distance'
				}
			)
			YIELD totalCost, nodeIds
			WITH totalCost, nodeIds
			ORDER BY totalCost ASC
			LIMIT 1

			UNWIND nodeIds as nodeId
			MATCH (n) WHERE id(n) = nodeId
			OPTIONAL MATCH (n)-[:IS_IN]->(a:Area)
			RETURN
				n.latitude AS latitude,
				n.longitude AS longitude,
				n.floor AS floor,
				n.id AS id,
				a.name AS building,
				n.name AS locationName
		";

		try
		{
			var results = await _neo4j.ExecuteReadQueryAsync(query, new { startId = request.Start });

			var path = new List<List<PathNodeDto>>();

			bool firstPass = true;
			string currArea = "";
			float currFloor = 0;
			int i = -1;

			foreach (var record in results)
			{
				var latitude = record["latitude"].ToString() ?? "";
				var longitude = record["longitude"].ToString() ?? "";
				var floor = record["floor"].ToString() ?? "";
				var id = record["id"].ToString() ?? "";
				var area = record["building"].ToString() ?? "";
				var name = record["locationName"].ToString() ?? null;

				var floorFloat = float.Parse(floor);

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

				path[i].Add(new PathNodeDto
				{
					Latitude = float.Parse(latitude),
					Longitude = float.Parse(longitude),
					Floor = float.Parse(floor),
					Building = area,
					Id = id
				});
			}

			if (path.Count > 0) return Ok(new { message = "Path found!", path });
			else return Ok(new { message = "No Path Found!" });
		}
		catch (Exception e)
		{
			Console.WriteLine($"Error: {e.Message}");
			return StatusCode(500, new { error = e.Message });
		}
	}

	/*

	[HttpPost("PopulateDb")]
	public async Task<IActionResult> PopulateDb()
	{
		await DbPopulator.RepopulatePois(_neo4j);

		return Ok();
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
		public bool Accessible { get; set; }
	}

	public class BathroomRequest
	{
		public int Start { get; set; }
		public char Gender { get; set; } = 'N';
	}

	public class LocationRequest
	{
		public string Building { get; set; } = string.Empty;
		public int Floor { get; set; }

		public float Latitude { get; set; }
		public float Longitude { get; set; }
	}
}


