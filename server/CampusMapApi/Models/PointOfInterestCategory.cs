using System.Text.Json.Serialization;
using System.ComponentModel;

namespace CampusMapApi.Models
{
	[JsonConverter(typeof(JsonStringEnumConverter))]
	public enum PointOfInterestCategory
	{
		[JsonPropertyName("academic")]
		[Description("Academic Department")]
		ACADEMIC,

		[JsonPropertyName("admin")]
		[Description("Administrative Department")]
		ADMIN,

		[JsonPropertyName("banking")]
		[Description("Banking")]
		BANKING,

		[JsonPropertyName("college")]
		[Description("College")]
		COLLEGE,

		[JsonPropertyName("center")]
		[Description("Center")]
		CENTER,

		[JsonPropertyName("dining")]
		[Description("Dining")]
		DINING,

		[JsonPropertyName("division")]
		[Description("Division")]
		DIVISION,

		[JsonPropertyName("institute")]
		[Description("Institute")]
		INSTITUTE,

		[JsonPropertyName("office")]
		[Description("Office")]
		OFFICE
	}

	public static class PointOfInterestCategoryExtensions
	{
		public static string FormatName(this Enum value)
		{
			var field = value.GetType().GetField(value.ToString());
			var attr = (DescriptionAttribute) Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute));

			return attr == null ? value.ToString() : attr.Description;
		}
	}
}