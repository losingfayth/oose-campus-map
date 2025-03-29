using CampusMapApi;

namespace CampusMapApi.Models
{
	class CodeArea(double southLat, double westLng, double northLat, double eastLng, int length)
	{
		public double SouthLatitude { get; set; } = southLat;
		public double WestLongitude { get; set; } = westLng;
		public double NorthLatitude { get; set; } = northLat;
		public double EastLongitude { get; set; } = eastLng;
		public int Length { get; set; } = length;

		public double GetCenterLatitude()
		{ return (SouthLatitude + NorthLatitude) / 2; }

		public double GetCenterLongitude()
		{ return (WestLongitude + EastLongitude) / 2; }
	}
}