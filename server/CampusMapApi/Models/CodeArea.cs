using CampusMapApi;

class CodeArea
{
	public double SouthLatitude { get; set; }
	public double WestLongitude { get; set; }
	public double NorthLatitude { get; set; }
	public double EastLongitude { get; set; }
	public int Length { get; set; }

	public double GetCenterLatitude()
	{ return (SouthLatitude + NorthLatitude) / 2; }

	public double GetCenterLongitude()
	{ return (WestLongitude + EastLongitude) / 2; }
}