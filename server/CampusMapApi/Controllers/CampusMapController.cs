using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Neo4j.Driver; // DB related functions

/**
Establishes a web API controller to handle server-side requests from front-end.

**API Enpoints**

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


  // http POST endpoint accessible at POST /api/CampusMap/find-path
  [HttpPost("find-path")]
  public async Task<IActionResult> FindPath([FromBody] PathRequest request) {
    
    int start = request.start;
    int destination = request.destination;

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
      await session.RunAsync(dropProjection);
      

      // create new graph projection
      var createProjection = @"
        CALL gds.graph.project(
          'campusGraph', {
            Location: {
                properties: ['latitude', 'longitude']
            }
          }, {
          CONNECTED_TO: {
              type: 'CONNECTED_TO',
              properties: 'distance'
          }
          }
        )";
      
      // run prjection creation query
      await session.RunAsync(createProjection);

      // query to use A* algorithm on database
      var query = @"
        MATCH (start:Location {id: $start})
        MATCH (end:Location {id: $destination})
        WHERE end.isValidDestination = 'TRUE'

        CALL {
          WITH start, end
          CALL gds.shortestPath.astar.stream('campusGraph', {
            sourceNode: start,
            targetNode: end,
            relationshipWeightProperty: 'distance',
            latitudeProperty: 'latitude',
            longitudeProperty: 'longitude'
          })
          YIELD nodeIds, totalCost
          RETURN nodeIds, totalCost
        }

        UNWIND nodeIds AS nodeId
        MATCH (n) WHERE id(n) = nodeId
        RETURN n.latitude AS latitude, n.longitude AS longitude
        ";


      var result = await session.RunAsync(query, new { start, destination });
      var records = await result.ToListAsync();

      var path = new List<List<string>>();

     foreach (var record in records) {
        var latitude = record["latitude"].ToString();
        var longitude = record["longitude"].ToString();
        path.Add(new List<string> { latitude, longitude });
      }


      return Ok(new { message = "No Path Found! :()" });

    } catch(Exception e) {
        Console.WriteLine($"Error: {e.Message}");
        return StatusCode(500, new { error = e.Message });
    }
  }

  /** 
  Queries database for all nodes and returns a list of location objects.
  http GET api endpoint accessible at GET /api/CampusMap/get-buildings
  */
  [HttpGet("get-buildings")]
  public async Task<IActionResult> GetBuildings([FromBody] PathRequest request) {

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
          MATCH (n:Location) 
          WHERE n.building IS NOT NULL 
          WITH n.building AS building, COLLECT(n)[0] AS node
          RETURN building, node.id AS id
        ";

    var locations = new List<string>(); // list of locations being queried

    try
    {

      // run the query on the database at store result set            
      var result = await session.RunAsync(query);

      // get the key attributes from each record and create a location 
      // node with those attributes. add the node to the list
      await result.ForEachAsync(record =>
      {

        string building = record["building"].As<string>();
        locations.Add(building);

      });

      // catch and display any errors encountered
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e.Message}");
    }

    // return the list of location nodes and the status of the call
    return Ok(locations);
  }

  /** 
  Queries database for all nodes and returns a list of location objects.
  http POST api endpoint accessible at GET /api/CampusMap/get-rooms
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

    // Cypher query that filters by building
    var query = @"
        MATCH (n:Location)
        WHERE n.name IS NOT NULL AND n.building = $building
        RETURN n.building AS building, n.name AS name, n.id AS id
    ";

    var locations = new List<LocationNode>();

    try
    {
      var result = await session.RunAsync(query, new { building });

      await result.ForEachAsync(record =>
      {
        LocationNode node = new LocationNode
        {
          building = record["building"].As<string>(),
          name = record["name"].As<string>(),
          id = record["id"].As<string>()
        };

        locations.Add(node);
      });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error: {e.Message}");
    }

    return Ok(locations);
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


