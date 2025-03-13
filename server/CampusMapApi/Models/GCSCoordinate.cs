using CampusMapApi;

/*
class DegreeMinuteSecond
{
	public double Degree { get; set; }
	public double Minute { get; set; }
	public double Second { get; set; }
}
*/

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

	public double GetLongitude() { return Longitude; }
	public double GetLatitude() { return Latitude; }

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
}