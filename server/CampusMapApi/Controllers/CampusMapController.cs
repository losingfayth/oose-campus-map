using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Neo4j.Driver; // DB related functions

/**
Establishes a web API controller to handle server-side requests from front-end.

**API Enpoints**

get-locations
- HttpGet request that takes no arguments. When called, does a DB query to Neo4j
  to retrieve building name, room number, and unique id of every node for every room
  on campus. Returns an IActionResult object that indicates the status of request
  completeion (400/404 bad, 200 good), and an List<> of LocationNode objects. Each
  node contains the previously queried data about each location on campus.
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
    public async Task<IActionResult> FindPath(int currLoc, int dest) {

      var path = new List<LocationNode>();
      
      // initial db connection
      var uri = "neo4j+s://apibloomap.xyz:7687";
      var username = Environment.GetEnvironmentVariable("DB_USER") 
        ?? throw new InvalidOperationException("DB_USER is not set");
      var password = Environment.GetEnvironmentVariable("DB_PASSWORD") 
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");
      IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
      await using var session = _driver.AsyncSession();
      
      // query to use A* algorithm on database
      var query = @"
      MATCH (n:Location)
      SET n.latitude = 0, n.longitude = n.id;

      MATCH (start:Location {id: $startId}), (end:Location {id: $endId})
      CALL gds.shortestPath.astar.stream('campusGraph', {
          sourceNode: start,
          targetNode: end,
          relationshipWeightProperty: 'distance',
          latitudeProperty: 'latitude',
          longitudeProperty: 'longitude'
      })
      YIELD nodeIds, totalCost
      RETURN nodeIds, totalCost;";
      
      var result = await session.RunAsync(query, new { currLoc, dest });
      var records = await result.ToListAsync();
      return records.Count > 0 ? records[0]["path"].As<List<string>>() : new List<string>();

      return Ok(path);
    }

    /** 
    Queries database for all nodes and returns a list of location objects.
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
      var query = "MATCH (n) WHERE EXISTS(n.building) RETURN DISTINCT n.building AS building, n.id AS id";
      var locations = new List<LocationNode>(); // list of locations being queried
      
      try {

        // run the query on the database at store result set            
        var result = await session.RunAsync(query);

        // get the key attributes from each record and create a location 
        // node with those attributes. add the node to the list
        await result.ForEachAsync(record => {

          // creating a new Location node
          LocationNode node = new LocationNode();

          // pulling data from each record and storing in node
          node.building = record["building"].As<string>();
          node.roomNumber = record["roomNumber"].As<string>();
          node.id = record["id"].As<string>();
          //node.displayName = $"{building} Room {roomNumber}";

          // add node to List<>
          locations.Add(node);

        });

        // catch and display any errors encountered
      } catch (Exception e) {
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
    public async Task<IActionResult> GetRooms() {
        
      // initial db connection
      var uri = "neo4j+s://apibloomap.xyz:7687";
      var username = Environment.GetEnvironmentVariable("DB_USER") 
        ?? throw new InvalidOperationException("DB_USER is not set");
      var password = Environment.GetEnvironmentVariable("DB_PASSWORD") 
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");
        
      IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
      await using var session = _driver.AsyncSession();

      // query to retrieve all nodes' building and room number attributes
      var query = "MATCH (n:Location) WHERE EXISTS(n.roomNumber) RETURN n.building AS building, n.roomNumber AS roomNumber, n.id AS id";
      var locations = new List<LocationNode>(); // list of locations being queried
      
      try {

        // run the query on the database at store result set            
        var result = await session.RunAsync(query);

        // get the key attributes from each record and create a location 
        // node with those attributes. add the node to the list
        await result.ForEachAsync(record => {

          // creating a new Location node
          LocationNode node = new LocationNode();

          // pulling data from each record and storing in node
          node.building = record["building"].As<string>();
          node.roomNumber = record["roomNumber"].As<string>();
          node.id = record["id"].As<string>();
          //node.displayName = $"{building} Room {roomNumber}";

          // add node to List<>
          locations.Add(node);

        });

        // catch and display any errors encountered
      } catch (Exception e) {
          Console.WriteLine($"Error: {e.Message}");
      }

     // return the list of location nodes and the status of the call
     return Ok(locations);
    }

}


