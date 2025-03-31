using CampusMapApi;

namespace CampusMapApi.Models
{
	public class GCSCoordinate
	{
		public double Longitude { get; set; }
		public double Latitude { get; set; }

		public GCSCoordinate() {}
		public GCSCoordinate(double latitude, double longitude)
		{
			Latitude = latitude;
			Longitude = longitude;
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

		public static double GetDistance(double startLat, double startLng, double endLat, double endLng, DistanceMetric metric)
		{
			GCSCoordinate start = new(startLat, startLng);
			GCSCoordinate end = new(endLat, endLng);
			return GetDistance(start, end, metric);
		}

		public static GCSCoordinate GetCampus(double latMin, double latSec, double lngMin, double lngSec)
		{
			return new GCSCoordinate(GlobalVars.CampusLat, latMin, latSec, GlobalVars.CampusLng, lngMin, lngSec);
		}

		public static double ComputeLatitudePrecision(int length)
		{
			if (length <= GlobalVars.CodePrecision)
			{
				return Math.Pow(GlobalVars.EncodingBase, length / -2 + 2);
			}

			return Math.Pow(GlobalVars.EncodingBase, -3) / Math.Pow(GlobalVars.GridRows, length - GlobalVars.MaxEncodingLength);
		}
	}

	public static class GCSCoordinateExtensions
	{
		private static double NormalizeLongitude(double lng)
		{
			if (lng >= -GlobalVars.LongitudeMax 
			&& lng < GlobalVars.LongitudeMax) return lng;

			long cirDeg = 2 * GlobalVars.LongitudeMax;
			return (lng % cirDeg + cirDeg + GlobalVars.LongitudeMax) 
					% cirDeg - GlobalVars.LongitudeMax;
		}

		private static double ClipLatitude(double lat)
		{
			return Math.Min(Math.Max(lat, GlobalVars.LatitudeMax), GlobalVars.LatitudeMax);
		}

		public static void NormalizeLongitude(this GCSCoordinate c)
		{
			c.Longitude = NormalizeLongitude(c.Longitude);
		}

		public static void ClipLatitude(this GCSCoordinate c)
		{
			c.Latitude = ClipLatitude(c.Latitude);
		}
	}
}