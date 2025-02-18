using Microsoft.AspNetCore.Mvc;

namespace CampusMapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampusMapController : ControllerBase
{

    private readonly ILogger<CampusMapController> _logger;

    public CampusMapController(ILogger<CampusMapController> logger)
    {
        _logger = logger;
    }

    [HttpGet("greeting")]
    public Greeting GetGreeting()
    {
      return new Greeting
        {
          Body = "Hello, world!"
        };
      }
}
