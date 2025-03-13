using CampusMapApi;
public class Path
{
    public double Distance {get; set;} = 0;
    public CoordinateConverter.Coordinate.DistanceMetric Metric {get; set;} 
    public int EstimateTravelTime {get; set;} = 0;   
}