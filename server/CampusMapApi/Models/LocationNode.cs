/**
Class representing a Location Node data object. Purpose of this class
is to store a series of attributes about locational data for serializing
and sening back and forth between front and back ends.
*/
namespace CampusMapApi.Models {

    public class LocationNode {
        public string Id { get; set; } = string.Empty; // unique node identifier
        public string LocationCode { get; set; } = string.Empty;
        public int Floor { get; set; } // floor level
        public string Building { get; set; } = string.Empty; // building name
        public string RoomNumber { get; set; } = string.Empty; // room number
        public bool IsValidDestination { get; set; } // can a user end at this destination?
    }
}