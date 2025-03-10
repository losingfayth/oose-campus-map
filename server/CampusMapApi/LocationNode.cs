namespace CampusMapApi
/**
Class representing a Location Node data object. Purpose of this class
is to store a series of attributes about locational data for serializing
and sening back and forth between front and back ends.
*/
public class LocationNode {
    public string locationCode {get; set;} = string.empty;
    public int floor {get; set;}
    public string building {get; set;} = string.empty;
    public string displayName {get; set;} = string.empty;
    public bool isValidDestination {get; set;} = string.empty;
}