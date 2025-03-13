/**
Class representing a Location Node data object. Purpose of this class
is to store a series of attributes about locational data for serializing
and sening back and forth between front and back ends.
*/
namespace CampusMapApi {

    public class LocationNode {
        public string id {get; set;} = string.Empty; // unique node identifier
        public string locationCode {get; set;} = string.Empty;
        public int floor {get; set;} // floor level
        public string building {get; set;} = string.Empty; // building name
        public string roomNumber {get; set;} = string.Empty; // room number
        public bool isValidDestination {get; set;} // can a user end at this destination?
    }
}