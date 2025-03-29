using CampusMapApi;
using CampusMapApi.Models;

namespace CampusMapApi.Models
{
    public class Path
    {
        public double Distance { get; set; } = 0;
        public DistanceMetric Metric { get; set; } 
        public int EstimateTravelTime { get; set; } = 0;   
    }
}