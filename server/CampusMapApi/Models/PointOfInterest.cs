using System.Text.Json.Serialization;

namespace CampusMapApi.Models
{
	public class PointOfInterest
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;

		[JsonPropertyName("abbr")]
		public string? Abbreviation { get; set; }

		[JsonPropertyName("room")]
		public string? Room { get; set; }
		
		[JsonPropertyName("bldg")]
		public string? Building { get; set; }

		[JsonPropertyName("cat")]
		public PointOfInterestCategory Category { get; set; }

		[JsonPropertyName("locId")]
		public int? LocationId { get; set; }
	}
}