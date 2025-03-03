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

    // http GET endpoint that will be accessible at GET /api/CampusMap/greeting
    [HttpGet("greeting")]
    public Greeting GetGreeting()
    {

      // returns a serialized JSON boject response
      return new Greeting
        {
          Body = "Hello, world!"
        };
      }
}
