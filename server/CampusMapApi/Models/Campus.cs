using CampusMapApi;

namespace CampusMapApi.Models 
{
	public class Campus
	{
		public string? Name { get; set; }
		public double Longitude { get; set; } = 41;
		public double Latitude { get; set; } = -76;
		public string? GridCode { get; set; } = "87H5";

	}
}
