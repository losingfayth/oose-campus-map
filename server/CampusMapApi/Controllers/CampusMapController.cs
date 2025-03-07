using Microsoft.AspNetCore.Mvc;

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

    // queries database for all nodes and returns a list of location objects
    // http GET endpoint accessible at GET /api/CampusMap/get-locations
    [HttpGet("get-locations")]
    public IActionResult getLocations() {

      var locations = new List<Location>();

    }

    //
    // http POST endpoint accessible at POST /api/CampusMap/find-path
    [HttpPost("find-path")]
    public IActionResult findPath() {

      var path = new List<Location>();

      return Ok(path)

    }



}

    // // http GET endpoint that will be accessible at GET /api/CampusMap/greeting
    // [HttpGet("greeting")]
    // public Greeting GetGreeting()
    // {

    //   // returns a serialized JSON boject response
    //   return new Greeting
    //     {
    //       Body = "Hello, world!"
    //     };
    //   }


