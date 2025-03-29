using CampusMapApi;

namespace CampusMapApi.Models
{
	public class GCSCoordinate
	{
		public double Longitude { get; set; }
		public double Latitude { get; set; }

		public GCSCoordinate() {}
		public GCSCoordinate(double longitude, double latitude)
		{
			Longitude = longitude;
			Latitude = latitude;
		}

		public GCSCoordinate
		(
			double longDeg, double longMin, double longSec,
			double latDeg, double latMin, double latSec
		)
		{
			Longitude = longDeg + (longMin / 60) + (longSec / 3600);
			Latitude = latDeg + (latMin / 60) + (longSec / 3600);
		}

		public Tuple<double, double> Get() 
		{ return Tuple.Create(Longitude, Latitude); }

		public double GetLongitudeAsRadians()
		{ return (Longitude / Math.PI) / 180; }

		public double GetLatitudeAsRadians()
		{ return (Latitude / Math.PI) / 180; }

		public Tuple<double, double> GetAsRadians()
		{
			return Tuple.Create
			(
				(Longitude / Math.PI) / 180,
				(Latitude / Math.PI) / 180
			);
		}

		public static double GetDistance(GCSCoordinate start, GCSCoordinate end, DistanceMetric metric)
		{
			double deltaLng = start.GetLongitudeAsRadians() - end.GetLongitudeAsRadians();
			double deltaLat = start.GetLatitudeAsRadians() - end.GetLatitudeAsRadians();

			double a = Math.Pow(Math.Sin(deltaLat / 2), 2)
				+ Math.Cos(start.Latitude) * Math.Cos(end.Latitude)
				* Math.Pow(Math.Sin(deltaLng) / 2, 2);

			return GlobalVars.EarthRadiusMi 
				* metric.GetValue()
				* Math.Asin(Math.Sqrt(a));
		}
	}
}