/**
Class representing a Location Node data object. Purpose of this class
is to store a series of attributes about locational data for serializing
and sening back and forth between front and back ends.
*/
namespace CampusMapApi.Models {

    public class LocationNode
    {
        public string Id { get; set; } = string.Empty; // unique node identifier
        public OpenLocationCode? LocationCode { get; set; }
        public int Floor { get; set; } // floor level
        public string Building { get; set; } = string.Empty; // building name
        public string RoomNumber { get; set; } = string.Empty; // room number
        public bool IsValidDestination { get; set; } // can a user end at this destination?
    }

    public static class LocationNodeExtensions
    {
        public static double DistanceTo(this LocationNode n1, LocationNode n2, DistanceMetric m)
        {
            return n1.LocationCode.DistanceTo(n2.LocationCode, m);
        }

        public static bool IsWithinThreeMeters(this LocationNode n1, LocationNode n2)
        {
            return string.Compare(n1.LocationCode.Code, n2.LocationCode.Code) == 0;
        }
    }
}