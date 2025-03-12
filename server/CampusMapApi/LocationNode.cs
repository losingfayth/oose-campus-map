namespace CampusMapApi {
/**
Class representing a Location Node data object. Purpose of this class
is to store a series of attributes about locational data for serializing
and sening back and forth between front and back ends.
*/
    public class LocationNode {
        public string id {get; set;}
        public string locationCode {get; set;} = string.Empty;
        public int floor {get; set;}
        public string building {get; set;} = string.Empty;
        public string roomNumber {get; set;} = string.Empty;
        public string displayName {get; set;} = string.Empty;
        public bool isValidDestination {get; set;}
    }
}