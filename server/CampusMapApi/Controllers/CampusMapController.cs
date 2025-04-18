using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Neo4j.Driver; // DB related functions

/**
Establishes a web API controller to handle server-side requests from front-end.

**API Enpoints**

find-path
- HttpPost request that recieves a JSON object containing two database node ids for
  a starting location and destination. Runs a query that finds the shortest path
  between two points. Returns a list of lists. Internal lists are length 2 and contain
  the latitude and longitude associated with each node along the shortest path.

get-buildings
- HttpGet request that takes no arguments. When called, does a DB query to Neo4j
  to retrieve building name, room number, and unique id of every node for every room
  on campus. Returns an IActionResult object that indicates the status of request
  completeion (400/404 bad, 200 good), and an List<> of LocationNode objects. Each
  node contains the previously queried data about each location on campus.

get-rooms
- HttpPut request that recieves a JSON object containing a string that defines the
  name of a building in the database. Queries for all valid destinations inside that buidling and adds them to a list
*/

namespace CampusMapApi.Controllers;


[ApiController] // marks this class as a web API controller
[Route("api/[controller]")] // define URL route for controller
public class CampusMapController : ControllerBase
{

  private readonly ILogger<CampusMapController> _logger;

  public CampusMapController(ILogger<CampusMapController> logger)
  {
    _logger = logger;
  }


  /*
  Queries database for shortest path between two points using A* GDS plugin for
  Neo4j. http POST endpoint accessible at POST /api/CampusMap/find-path
  */
  [HttpPost("find-path")]
  public async Task<IActionResult> FindPath([FromBody] PathRequest request)
  {

    int start = request.start; // get starting node id
    int destination = request.destination; // get destination node id

    // initial db connection
    var uri = "neo4j+s://apibloomap.xyz:7687";
    var username = Environment.GetEnvironmentVariable("DB_USER")
      ?? throw new InvalidOperationException("DB_USER is not set");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
      ?? throw new InvalidOperationException("DB_PASSWORD is not set");
    IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
    await using var session = _driver.AsyncSession();

    try
    {

      // drop existing graph projection
      var dropProjection = @"
      CALL gds.graph.drop('campusGraph', false);";
      await session.RunAsync(dropProjection);

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
      await session.RunAsync(createProjection);

      // query to use A* algorithm on database
      var query = @"
        MATCH (startNode:Location {id: $start})
        MATCH (endNode:Location {id: $destination})
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

      // run the above query on the database with the provided starting and ending
      // ids, then put it into a list
      var result = await session.RunAsync(query, new { start, destination });
      var records = await result.ToListAsync();

      var path = new List<List<PathNodeDto>>(); // list of lists for node data
      bool firstPass = true; // flags if it is first pass-through records
      string currArea = ""; // tracking variable to store current area nodes are in
      string currFloor = ""; // tracking variable to store current floor nodes are in
      int i = -1; // iterator var

      // iterate over the list of nodes, getting each lat and long value and adding
      // it to the path List<>
      foreach (var record in records) {

        // initialize records from node
        var latitude = record["latitude"].ToString();
        var longitude = record["longitude"].ToString();
        var floor = record["floor"].ToString();
        var id = record["id"].ToString();
        var area = record["building"].ToString();

        // check if this is the first pass-through the records. if so, initialize
        // what area and building we are starting in
  

        // check if the area and floor of the current node matches those of the
        // prvious one. if not, increment the index of path
        if (firstPass || currArea != area || currFloor != floor) {
          path.Add(new List<PathNodeDto>());
          i++;
          currArea = area;
          currFloor = floor;
          firstPass = false;
        } 

        // add a new node at the correct index
        path[i].Add(new PathNodeDto {
          latitude = float.Parse(latitude),
          longitude = float.Parse(longitude),
          floor = float.Parse(floor),
          building = area,
          id = id
          });
      }

      // check if a path was found and return it if it was
      if (path.Count > 0)
      {
        return Ok(new { message = "Path found!", path });
      }
      else
      {
        return Ok(new { message = "No Path Found!" });
      }

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e.Message}");
      return StatusCode(500, new { error = e.Message });
    }
  }

  [HttpGet("get-hello")]

  public async Task<IActionResult> GetHello()
  {
    return Ok("hello");
  }


  /** 
  Queries database for all nodes and returns a list of building names.
  http GET api endpoint accessible at GET /api/CampusMap/get-buildings
  */
  [HttpGet("get-buildings")]
  public async Task<IActionResult> GetBuildings() {

    // initial db connection
    var uri = "neo4j+s://apibloomap.xyz:7687";
    var username = Environment.GetEnvironmentVariable("DB_USER")
      ?? throw new InvalidOperationException("DB_USER is not set");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
      ?? throw new InvalidOperationException("DB_PASSWORD is not set");

    IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
    await using var session = _driver.AsyncSession();

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
      var result = await session.RunAsync(query);

      // get the key attributes from each record and create a location 
      // node with those attributes. add the node to the list
      await result.ForEachAsync(record => {
        BuildingDto node = new BuildingDto();
        node.name = record["name"].As<string>();
        buildings.Add(node);
      });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e.Message}");
    }

    // return the list of location nodes and the status of the call
    return Ok(buildings);
  }

  /** 
  Queries database for all rooms withing a building and returns a 
  list of location objects. Http POST api endpoint accessible at 
  GET /api/CampusMap/get-rooms
  */
  [HttpPost("get-rooms")]
  public async Task<IActionResult> GetRooms([FromBody] BuildingRequest request)
  {
    var building = request.building;

    // initial db connection
    var uri = "neo4j+s://apibloomap.xyz:7687";
    var username = Environment.GetEnvironmentVariable("DB_USER")
        ?? throw new InvalidOperationException("DB_USER is not set");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");

    IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
    await using var session = _driver.AsyncSession();

    // query to get every room in a building from database
    var query = @"
        MATCH (a:Area {name: $building})<-[:IS_IN]-(l:Location)
        RETURN a.name AS building, l.name AS name, l.id AS id
    ";

    // list to hold locations
    var rooms = new List<RoomDto>();

    try
    {

      // run the building query
      var result = await session.RunAsync(query, new { building });

      // iterate over results to get all of the buildings and their ids
      await result.ForEachAsync(record => {
        RoomDto room = new RoomDto {
          building = record["building"].As<string>(),
          name = record["name"].As<string>(),
          id = record["id"].As<string>()
        };

        // add each location node to the list
        rooms.Add(room);
      });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e.Message}");
    }

    return Ok(rooms);
  }


  // DTO for request body
  public class BuildingRequest
  {
    public string building { get; set; }
  }

  public class PathRequest
  {
    public int start { get; set; }
    public int destination { get; set; }
  }


}


