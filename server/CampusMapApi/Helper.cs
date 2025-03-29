<<<<<<< HEAD

using CampusMapApi;
using CampusMapApi.Models;

/**
    <summary>

    Provides static Helper functions for totaling MapPath distance and estimating travel times.

        - Requires Node data to be in the form described by Jess, namely with
        location described by Plus Codes in the LocationCode attribute and
        floor information in the Floor attribute. 
        - Assumes average walking speed, and that each subsequent stairwell
        climbed is climbed slower than the previous.
        - Default behavior is to return the total distance of a path in Feet and
        estimated travel time in seconds.

    </summary>
    <author> Dakotah Kurtz </author>
*/
=======
/// <summary>
/// Provides static Helper functions for totaling MapPath distance and estimating travel times.
/// Requires Node data to be in the form described by Jess, namely with location described by Plus Codes in
/// the LocationCode attribute and floor information in the Floor attribute. 
/// 
/// Assumes average walking speed, and that each subsequent stairwell climbed is climbed slower than the previous.
/// 
/// Default behavior is to return the total distance of a path in Feet and estimated travel time in seconds.
/// 
/// Dakotah
/// </summary>
>>>>>>> ad5169eb057b5f584bed1a45c5a54007a63e8e38

namespace CampusMapApi
{
    public class HelperFunctions()
    {

        static readonly int AVG_MPH_WALKING_SPEED = 3;
        private static readonly double SEC_PER_HOUR = 3600;
        static readonly int STAIRWELL_TRAVERSAL_TIME_IN_SECONDS = 20;
        private static readonly double STAIRWELL_TRAVERSAL_SLOWING_FACTOR = 1.2;
    
        /// <summary>
        /// Estimates the time required to travel along the given path, essentially calculating
        /// distance(node1, node2) + distance(node2, node3) + ...
        /// 
        /// Provides the estimate in a whole number of seconds.
        /// </summary>
        /// <param name="path">List of LocationNode objects, where path[0] is the starting node, and path[path.Count - 1] 
        /// is the destination node.
        /// </param>
        /// <returns> A MapPathData object containing:
        //  Distance: the total distance of the path in units of
        //  Metric: The unit of distance the previous return value is in
        //  EstimateTravelTime: The estimated time to traverse the given path, in seconds.
                // </returns>
        static MapPath EstimateTravelTime(List<LocationNode> path) {

            // Default metric is Feet
            DistanceMetric distanceMetric = DistanceMetric.Feet;
            double pathDistance = 0;
            int travelTime = 0;
            int floorCount;
            int i = 0;

            while (i < path.Count - 1) {
                // Traversing stairs doesn't effect distance, but still needs to add to the time estimate
                if (TraversingStairwell(i, path)) {
                    floorCount = i; // count how many floors in total are traversed at this LocationCode
                    i++;
                    while (i + 1 < path.Count && TraversingStairwell(i, path)) {
                        i++;
                    }
                    int floorChange = Math.Abs(path[floorCount].Floor - path[i].Floor);
                    // Assume climbing consecutive flights of stairs takes longer that 1 flight * number of flights
                    // The formula below is the outcome of the following recurrence relation:
                    // x_0 = c, and x_n = x_n-1 + cx^n, where c is the default time to climb one flight of stairs and x is
                    // the "slow down" factor. That recurrence relation is totally just made up - but I think it
                    // models reality decently well. Good enough, anyway.
                    travelTime += (int) Math.Floor(STAIRWELL_TRAVERSAL_TIME_IN_SECONDS * ((Math.Pow(STAIRWELL_TRAVERSAL_SLOWING_FACTOR, floorChange) - 1) / (STAIRWELL_TRAVERSAL_SLOWING_FACTOR - 1)));

                }

                if (i >= path.Count - 1) {
                    break;
                }

                LocationNode at = path[i];
                LocationNode to = path[i+1];
                pathDistance += at.DistanceTo(to, distanceMetric);
                
                //GCSCoordinate.GetDistance(at.LocationCode, to.LocationCode, distanceMetric);

                i++;
            }

            // Convert from MPH to unitsPerSecond
            double unitsPerSecond = DistanceMetric.Miles.ConvertTo(distanceMetric, AVG_MPH_WALKING_SPEED) / SEC_PER_HOUR;

            travelTime += (int) Math.Floor(pathDistance / unitsPerSecond);

            return new MapPath {
                Distance = pathDistance,
                Metric = distanceMetric,
                EstimateTravelTime = travelTime
            };

        }

        /// <summary>
        /// For now, we assume two nodes span a stairwell if both nodes are at the same Plus Location Code, but
        /// reference different floors.
        /// </summary>
        /// <param name="locCode1"></param>
        /// <param name="locCode2"></param>
        /// <returns> True if the points are on different floors at the same Location Code</returns>
        private static bool TraversingStairwell(int i, List<LocationNode> path) {
                LocationNode at = path[i];
                LocationNode to = path[i+1];

                return at.IsWithinThreeMeters(to) && at.Floor != to.Floor;
        }


/// <summary>
/// Stores data pertaining to a path (An ordered list of LocationNodes)
/// Contains 
// Distance: total distance of path in
/// Metric: the units of distance
/// EstimateTravelTime: The estimated time needed to traverse the path (in seconds)
/// </summary>


    public static void TravelTimeTest() {
        LocationNode ln1 = new()
        {
            LocationCode = new OpenLocationCode("2G4X+7FX"),
            Floor = 0,
            
        };

        LocationNode ln2 = new() 
        {
            LocationCode = new OpenLocationCode("2H53+HQM"),
            Floor = 0,
        };

        LocationNode ln3 = new()
        {
            LocationCode = new OpenLocationCode("2H53+HQM"),
            Floor = 2,
        };

        LocationNode ln4 = new()
        {
            LocationCode = new OpenLocationCode("2H53+976"),
            Floor = 0,
        };

        List<LocationNode> locationNodes = [ln1, ln2];
        MapPath pathData = EstimateTravelTime(locationNodes);
        Console.WriteLine(pathData.Distance + ", " + pathData.EstimateTravelTime);

        locationNodes = [ln2, ln1];
        pathData = EstimateTravelTime(locationNodes);
        Console.WriteLine(pathData.Distance + ", " + pathData.EstimateTravelTime);

        List<LocationNode> ln1To3 = [ln1, ln2, ln3];
        List<LocationNode> ln2To3 = [ln2, ln3];

        Console.WriteLine(ln1To3[2].LocationCode);

        MapPath pd1 = EstimateTravelTime(ln1To3);
        MapPath pd2 = EstimateTravelTime(ln2To3);

        Console.WriteLine(pd1.Distance + ", " + pd1.EstimateTravelTime);
        Console.WriteLine(pd2.Distance + ", " + pd2.EstimateTravelTime);

    }
}
}