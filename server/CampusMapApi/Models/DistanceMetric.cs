using CampusMapApi;

public enum DistanceMetric
{
	Miles,
	Feet,
	Kilometer,
	Meters
}

public static class DistanceExtensions
{
	public static Dictionary<DistanceMetric, float> ConversionTable()
	{
		return new Dictionary<DistanceMetric, float>
        {
            { DistanceMetric.Miles, 1 },
            { DistanceMetric.Feet, 5280 },
            { DistanceMetric.Kilometer, (float)1.60934 },
            { DistanceMetric.Meters, (float)1609.34 }
        };
	}

	public static double Convert(DistanceMetric from, DistanceMetric to, double value)
	{
		Dictionary<DistanceMetric, float> conversionTable = ConversionTable();

		double inMiles = value / conversionTable[from];
		return inMiles * conversionTable[to];
	}

	public static double GetDistanceMetric(GCSCoordinate start,
		GCSCoordinate end, DistanceMetric metric)
	{
		int radiusOfEarth = 3956; // in miles

		double deltaLng = start.GetLongitudeAsRadians() - end.GetLongitudeAsRadians();
		double deltaLat = start.GetLatitudeAsRadians() - end.GetLatitudeAsRadians();

		double a = Math.Pow(Math.Sin(deltaLat / 2), 2)
			+ Math.Cos(start.Latitude) * Math.Cos(end.Latitude)
			* Math.Pow(Math.Sin(deltaLng) / 2, 2);

		Dictionary<DistanceMetric, float> conversionTable = ConversionTable();

		return radiusOfEarth 
			* conversionTable[metric] 
			* Math.Asin(Math.Sqrt(a));
	}
}