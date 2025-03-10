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
    public IActionResult GetLocations() {



      var locations = new List<LocationNode>();

    }

    //
    // http POST endpoint accessible at POST /api/CampusMap/find-path
    [HttpPost("find-path")]
    public IActionResult FindPath(float currLoc, float dest) {

      var path = new List<LocationNode>();

      return Ok(path)

    }

}


