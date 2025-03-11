using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Neo4j.Driver;

namespace CampusMapApi.Controllers;


[ApiController] // marks this class as a web API controller
[Route("api/[controller]")] // define URL route for controller
public class CampusMapController : ControllerBase
{
  
    // allows controller to log messages
    private readonly ILogger<CampusMapController> _logger;

    public CampusMapController(ILogger<CampusMapController> logger)
    {
        _logger = logger;
    }

    
    // http POST endpoint accessible at POST /api/CampusMap/find-path
    [HttpPost("find-path")]
    public Task<IActionResult> FindPath(float currLoc, float dest) {

      //var path = new List<LocationNode>();
      var path = new {message = "API Endpoint Response Good!"};

      return Task.FromResult<IActionResult>(Ok(path));

    }

    // queries database for all nodes and returns a list of location objects
    // http GET endpoint accessible at GET /api/CampusMap/get-locations
    [HttpGet("get-locations")]
    public Task<IActionResult> GetLocations() {
        // initial db connection
      var uri = "neo4j+s://apibloomap.xyz:7687";
      var username = Environment.GetEnvironmentVariable("DB_USER") 
        ?? throw new InvalidOperationException("DB_USER is not set");
      var password = Environment.GetEnvironmentVariable("DB_PASSWORD") 
        ?? throw new InvalidOperationException("DB_PASSWORD is not set");
        
      IDriver _driver = GraphDatabase.Driver(uri, AuthTokens.Basic(username, password));
      await using var session = _driver.AsyncSession();

      var query = "MATCH (n) RETURN n.building AS building, n.roomNumber AS roomNumber";

      var locations = new List<LocationNode>();
      
      try {
            
        var result = await session.RunAsync(query);

        // Process each record in the result set
        await result.ForEachAsync(record => {

          string building = record["building"].As<string>();
          string roomNumber = record["roomNumber"].As<string>();

          string formattedRoom = $"{building} Room {roomNumber}";

          LocationNode node = new LocationNode();
          node.building = building;
          node.roomNumber = roomNumber;
          node.displayName = formattedRoom;
          locations.Add(node);

        });

      } catch (Exception ex) {
          Console.WriteLine($"Error: {ex.Message}");
      }
        //var path = new List<LocationNode>();
        //var path = new {message = "API Endpoint Response Good!"};
     return Task.FromResult<IActionResult>(Ok(locations));
    }

}


