using Microsoft.AspNetCore.Mvc;
using CampusMapApi.Models;

namespace CampusMapApi.Controllers;

[ApiController]
[Route("api/OLC/[controller]")]
public class OLCController : ControllerBase
{
	[HttpPost("GetDistance")]
	public Task<IActionResult> GetDistance(string c1, string c2, string distanceMetric)
	{
		double ret = OpenLocationCode.GetDistance(c1, c2, (DistanceMetric) Enum.Parse(typeof(DistanceMetric), distanceMetric));
		return Task.FromResult<IActionResult>(Ok(ret));
	}

	[HttpPost("ValidateCode")]
	public Task<IActionResult> ValidateCode(string c)
	{
		bool ret = OpenLocationCode.Validate(c);
		return Task.FromResult<IActionResult>(Ok(ret));
	}
}