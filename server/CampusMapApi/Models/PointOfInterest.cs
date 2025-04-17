namespace CampusMapApi.Models
{
	public class PointOfInterest
	{
		public string Name { get; set; } = string.Empty;
		public string? Abbreviation { get; set; }
		public string? Room { get; set; }
		public string Building { get; set; } = string.Empty;
		public PointOfInterestCategory Category { get; set; }
	}
}