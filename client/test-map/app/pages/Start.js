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
import SearchBar from "../../components/SearchBar";
import { points } from "../../utils/Points";

import { loadImageReferences } from "../../utils/imagePaths.js";

import { getBuildings, getRooms, findPath } from "../../utils/api_functions";
import ProcessedPath from "../../dataObject/ProcessedPath.js";

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

  const [filteredRoomNumbers, setFilteredRoomNumbers] = useState([]);
  const [selectedStartRoomId, setSelectedStartRoomId] = useState(null);
  const [filteredEndRoomNumbers, setFilteredEndRoomNumbers] = useState([]);
  const [selectedEndRoomId, setSelectedEndRoomId] = useState(null);

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
        // console.log("Get Rooms: ", await getRooms("Navy"));
        var buildingNames = [];
        for (let i = 0; i < buildings.length; i++) {
          buildingNames.push(buildings[i].name);
        }
        setBuildingOptions(buildingNames); // save to state
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
              source={require("../../assets/cropped-huskie.png")}
              style={{ height: 40, width: 40 }}
            />
          </Marker>
        )}
      </MapView>

      {/* Search Button */}
      <Pressable
        style={styles.button}
        onPress={() => {
          // Check if all necessary values are set
          if (
            true
            // selectedStartBuilding !== null &&
            // selectedStartRoom !== null &&
            // selectedEndBuilding !== null &&
            // selectedEndRoom !== null
          ) {
            console.log("Not null");

            async function getPath() {
              try {
                // Create array of room IDs: [fromRoomId, toRoomId]
                // const roomIdArray = [selectedStartRoomId, selectedEndRoomId];
                const roomIdArray = [22, 1078];

                console.log("Room ID array:", roomIdArray);

                var pathData = await findPath(roomIdArray[0], roomIdArray[1]);

                var processedPath = new ProcessedPath(pathData.path);

                console.log(processedPath.getStringRepresentation());
                // console.log("entire pathData: " + pathData);

                // console.log("pathData.path: " + pathData.path);
                // console.log("Prayer: " + pathData.path[0])

                // console.log(processedPath.getStringRepresentation());
                // console.log("Get Rooms: ", await getRooms("Navy"));
                // setBuildingOptions(buildings); // save to state
              } catch (e) {
                console.error("Error fetching path:", e);
              }
            }

            getPath();

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
      {/* "From" Building Search Bar */}
      {/* "From" Building Search Bar */}
      <SearchBar
        searchFilterData={buildingOptions} // options for buildings
        customStyles={{ left: "5%", width: "60%" }}
        placeholderText="From"
        onTypingChange={setIsBuildingTyping} // updates typing state if needed
        onSelect={(building) => {
          if (!building) return; // safety check
          setStartBuilding(building); // save selected building

          // Fetch all rooms for the selected building
          getRooms(building)
            .then((rooms) => {
              // Filter only rooms that include the word "room" in their name
              const filteredRooms = rooms.filter((room) =>
                room.name.toLowerCase().includes("room")
              );

              // Save the full filtered room objects (not just names)
              setFilteredRoomNumbers(filteredRooms);
            })
            .catch((error) => {
              console.error(
                "Error fetching rooms for building:",
                building,
                error
              );
            });
        }}
      />

      {/* "From" Room Search Bar */}
      <SearchBar
        customStyles={{ width: "31%", left: "64%", borderColor: "black" }}
        showIcon={false}
        searchFilterData={filteredRoomNumbers.map((r) => r.name)} // show only room names in dropdown
        searchFilterStyles={{ width: "100%" }}
        placeholderText="Room #"
        onTypingChange={setIsRoomTyping}
        onSelect={(selectedName) => {
          // Find the full room object matching the selected name
          const matched = filteredRoomNumbers.find(
            (room) => room.name === selectedName
          );
          if (matched) {
            setStartRoom(matched.name); // save room name
            setSelectedStartRoomId(matched.id); // save room id
            console.log("Selected room:", matched.name, "| ID:", matched.id);
          }
        }}
      />

      {/* "To" Building Search Bar */}
      <SearchBar
        searchFilterData={buildingOptions} // same list of buildings
        customStyles={{ top: "16%", left: "5%", width: "60%" }}
        placeholderText="To"
        onSelect={(building) => {
          if (!building) return;
          setEndBuilding(building); // save destination building

          // Fetch and filter rooms for this building
          getRooms(building)
            .then((rooms) => {
              const filteredRooms = rooms.filter((room) =>
                room.name.toLowerCase().includes("room")
              );

              // Save filtered room objects for "To" field
              setFilteredEndRoomNumbers(filteredRooms);
            })
            .catch((error) => {
              console.error(
                "Error fetching TO rooms for building:",
                building,
                error
              );
            });
        }}
      />

      {/* "To" Room Search Bar */}
      <SearchBar
        customStyles={{
          top: "16%",
          width: "31%",
          left: "64%",
          borderColor: "black",
        }}
        showIcon={false}
        searchFilterData={filteredEndRoomNumbers.map((r) => r.name)} // only names in dropdown
        searchFilterStyles={{ width: "100%" }}
        placeholderText="Room #"
        onSelect={(selectedName) => {
          // Find the full room object from the selected name
          const matched = filteredEndRoomNumbers.find(
            (room) => room.name === selectedName
          );
          if (matched) {
            setEndRoom(matched.name); // save destination room name
            setSelectedEndRoomId(matched.id); // save its ID
            console.log("Selected TO room:", matched.name, "| ID:", matched.id);
          }
        }}
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
