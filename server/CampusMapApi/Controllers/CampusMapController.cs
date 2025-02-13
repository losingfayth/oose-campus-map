using Microsoft.AspNetCore.Mvc;

namespace CampusMapApi.Controllers;

[ApiController]
[Route("[controller]")]
public class CampusMapController : ControllerBase
{

    private readonly ILogger<CampusMapController> _logger;

    public CampusMapController(ILogger<CampusMapController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetGreeting")]
    public Greeting Get()
    {
		return new Greeting
		{
			Hello = "Hello, world!"
		};
    }
}
