import React, { useEffect, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  Pressable,
  Text,
} from "react-native";
import { Link, router } from "expo-router";
import * as Location from "expo-location";
import SearchBar from "../components/SearchBar";
import { searchables, roomNumbers } from "../components/test/Words";
import { points } from "../components/Points";
import { getBuildings, getRooms, findPath } from "../apis/api_functions";

export default function Start() {
  const [location, setLocation] = useState(null);
  const [subscription, setTracker] = useState(null);
  const [region, setRegion] = useState({
    latitude: 41.007799728334525,
    longitude: -76.44851515601727,
    latitudeDelta: 0.00922,
    longitudeDelta: 0.00421,
  });

  const [isRegionSet, setIsRegionSet] = useState(false); // New state to track if the region has been set
  const [isBuildingTyping, setIsBuildingTyping] = useState(false);
  const [isRoomTyping, setIsRoomTyping] = useState(false);

  // State to store selected from and room values
  const [selectedStartBuilding, setStartBuilding] = useState(null);
  const [selectedStartRoom, setStartRoom] = useState(null);
  const [selectedEndBuilding, setEndBuilding] = useState(null);
  const [selectedEndRoom, setEndRoom] = useState(null);

  const [buildingOptions, setBuildingOptions] = useState([]);

  // set up a useEffect to request permissions, fetch user location, and track location
  useEffect(() => {
    // request user location to use while app is running
    async function getPermissionsAndStartWatching() {
      // wait until we get permission granted or denied
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission not granted");
        return;
      }

      // Get initial location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // Start watching position updates
      const newTracker = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10, // time in milliseconds
          distanceInterval: 1, // update after this many meters moved
        },
        (location_update) => {
          //console.log('Updated location:', location_update.coords);
          setLocation(location_update.coords);
        }
      );
      setTracker(newTracker);
    }

    getPermissionsAndStartWatching();

    // Stop watching location when the app closes or user navigates to another screen
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Handle region change only if the region hasn't been set yet
  const handleRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
  };

  // Update region with location data when it's available
  useEffect(() => {
    if (location && !isRegionSet) {
      const newRegion = {
        // latitude: location.latitude,
        // longitude: location.longitude,
        latitude: 41.007799728334525,
        longitude: -76.44851515601727,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      };
      setRegion(newRegion);
      setIsRegionSet(true); // Mark that the region is set
    }
  }, [location, isRegionSet]); // Ensure this runs only when the location is available

  // Get buildings when the program starts
  useEffect(() => {
    async function fetchBuildings() {
      try {
        const buildings = await getBuildings();

        console.log(buildings);
        setBuildingOptions(buildings); // save to state
      } catch (e) {
        console.error("Error fetching buildings:", e);
      }
    }

    fetchBuildings();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Text above search bars*/}
      <View style={styles.textBox}>
        <Text style={styles.text}>RoonGO</Text>
      </View>

      <MapView
        style={styles.map}
        region={region} // Directly control region without initialRegion
        // minZoomLevel={16} // Ensure minimum zoom level is appropriate
        onRegionChangeComplete={handleRegionChangeComplete} // update the zoom level when the user changes it
        minZoomLevel={16}
      >
        {/* Marker showing the User's location */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          >
            <Image
              source={require("../assets/cropped-huskie.png")}
              style={{ height: 40, width: 40 }}
            />
          </Marker>
        )}
      </MapView>

      {/* Search Button */}
      <Pressable
        style={styles.button}
        onPress={() => {
          // Check if we have a building and room # for current location and destination
          if (
            true
            // selectedStartBuilding !== null &&
            // selectedStartRoom !== null &&
            // selectedEndBuilding !== null &&
            // selectedEndRoom !== null
          ) {
            console.log("Not null");

            // Testing getting the array of buildings
            const locs = ["BFB-1", "OUT", "NAVY-1", "NAVY-2"];
            router.push({
              pathname: `/buildings/${locs[0]}`,
              params: {
                categories: JSON.stringify(locs),
                coords: JSON.stringify(points),
                currLoc: 0,
                maxLocs: locs.length - 1,
              },
            });
          } else {
            console.log("One or more values are null");
          }
        }}
      >
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>

      {/* Search bar with first being for building and second for room number */}
      <SearchBar
        searchFilterData={buildingOptions}
        customStyles={{ left: "5%", width: "60%" }}
        placeholderText="From"
        onTypingChange={setIsBuildingTyping}
        onSelect={setStartBuilding} // Set selected "From" value
      />
      <SearchBar
        customStyles={{ width: "31%", left: "64%", borderColor: "black" }}
        showIcon={false}
        searchFilterData={roomNumbers}
        searchFilterStyles={{ width: "100%" }}
        placeholderText="Room #"
        onTypingChange={setIsRoomTyping}
        onSelect={setStartRoom} // Set selected "Room" value
      />

      {/* Second set of two search bars.*/}
      <SearchBar
        searchFilterData={buildingOptions}
        customStyles={{ top: "16%", left: "5%", width: "60%" }}
        placeholderText="To"
        onSelect={setEndBuilding}
      />
      <SearchBar
        customStyles={{
          top: "16%",
          width: "31%",
          left: "64%",
          borderColor: "black",
        }}
        showIcon={false}
        searchFilterData={roomNumbers}
        searchFilterStyles={{ width: "100%" }}
        placeholderText="Room #"
        onSelect={setEndRoom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  textBox: {
    position: "absolute",
    top: 40,
    justifyContent: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 5,
    zIndex: 10, // Ensures it stays on top of other content
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    position: "absolute",
    top: "24%",
    right: "5%",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    borderColor: "black",
    borderWidth: 2,
  },
  buttonText: {
    color: "grey",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
