using CampusMapApi;

namespace CampusMapApi.Models
{
	public enum DistanceMetric
	{
		Miles,
		Feet,
		Kilometer,
		Meters
	}

	public static class DistanceMetricExtensions
	{
		public static readonly Dictionary<DistanceMetric, float> ConversionTable = new()
		{
				{ DistanceMetric.Miles, 1 },
				{ DistanceMetric.Feet, 5280 },
				{ DistanceMetric.Kilometer, (float) 1.60934 },
				{ DistanceMetric.Meters, (float) 1609.34 }
		};

		public static float GetValue(this DistanceMetric metric)
		{
			return ConversionTable[metric];
		} 

		public static double Convert(DistanceMetric from, DistanceMetric to, double value)
		{
			double inMiles = value / ConversionTable[from];
			return inMiles * ConversionTable[to];
		}

		public static double ConvertTo(this DistanceMetric from, DistanceMetric to, double value)
		{
			return Convert(from, to, value);
		}
	}
}