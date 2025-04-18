/**
Class representing a Location Node data object. Purpose of this class
is to store a series of attributes about locational data for serializing
and sening back and forth between front and back ends.
*/
namespace CampusMapApi
{

    public class LocationNode
    {
        public string id { get; set; } = string.Empty; // unique node identifier
        public string building { get; set; } = string.Empty; // building name
        public float latitude { get; set; } // latitude
        public float longitude { get; set; } // longitude
        public float floor { get; set; } // floor level
        public string name { get; set; } = string.Empty; // room descriptor
        public bool isValidDestination { get; set; } // can a user end at this destination?
    }
}