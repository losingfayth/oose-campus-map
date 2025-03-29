using Microsoft.AspNetCore.Mvc;
using CampusMapApi.Models;

namespace CampusMapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GCSController : ControllerBase
{
	[HttpPost("GetDistance")]
	public Task<IActionResult> GetDistance(double c1Lat, double c1Lng, double c2Lat, double c2Lng, string distanceMetric)
	{
		double ret = GCSCoordinate.GetDistance(c1Lat, c1Lng, c2Lat, c2Lng, (DistanceMetric) Enum.Parse(typeof(DistanceMetric), distanceMetric));
		return Task.FromResult<IActionResult>(Ok(ret));
	}

	[HttpPost("ClipLatitude")]
	public Task<IActionResult> ClipLatitude(double lat)
	{
		double ret = GCSCoordinate.ClipLatitude(lat);
		return Task.FromResult<IActionResult>(Ok(ret));
	}

	[HttpPost("NormalizeLongitude")]
	public Task<IActionResult> NormalizeLongitude(double lng)
	{
		double ret = GCSCoordinate.NormalizeLongitude(lng);
		return Task.FromResult<IActionResult>(Ok(ret));
	}

	[HttpPost("GetLatitudePrecision")]
	public Task<IActionResult> GetLatitudePrecision(int len)
	{
		double ret = GCSCoordinate.ComputeLatitudePrecision(len);
		return Task.FromResult<IActionResult>(Ok(ret));
	}
}