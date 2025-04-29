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
import { Link } from "expo-router";
import * as Location from "expo-location";
import SearchBar from "../../components/SearchBar";
// import { searchables, roomNumbers } from "../components/test/Words";

export default function App() {
  const [location, setLocation] = useState(null);
  const [subscription, setTracker] = useState(null);
  const [region, setRegion] = useState({
    latitude: 41.007799728334525,
    longitude: -76.44851515601727,
    latitudeDelta: 0.00922,
    longitudeDelta: 0.00421,
  });

  const [isRegionSet, setIsRegionSet] = useState(false); // New state to track if the region has been set
  const [isTyping, setIsTyping] = useState(false);

  // State to store selected from and room values
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const routeCoordinates = [
    // Apple maps
    // { latitude: 41.006960, longitude: -76.448590 }, // Point a
    // { latitude: 41.007050, longitude: -76.448650 }, // Point b
    // { latitude: 41.007150, longitude: -76.448610 },
    // { latitude: 41.007230, longitude: -76.448520 }, // Point c
    // { latitude: 41.007249, longitude: -76.448466 }, // Point d
    { latitude: 41.0069, longitude: -76.44911 }, // first
    { latitude: 41.006774, longitude: -76.449009 },
    { latitude: 41.006975, longitude: -76.448576 },
    { latitude: 41.007099, longitude: -76.448645 },
    { latitude: 41.007242, longitude: -76.448531 },
    { latitude: 41.007249, longitude: -76.448466 },
    { latitude: 41.007319, longitude: -76.448316 },
    { latitude: 41.007191, longitude: -76.448214 },
    { latitude: 41.007175, longitude: -76.448248 },
    { latitude: 41.007099, longitude: -76.448306 },
    { latitude: 41.00699, longitude: -76.44822 },
    // { latitude: 41.006980, longitude: -76.448245 },
    { latitude: 41.00695003, longitude: -76.44821454 },
    { latitude: 41.00690578, longitude: -76.4483156 },
    { latitude: 41.00693638, longitude: -76.4483393 },
    { latitude: 41.00696368, longitude: -76.44836176 },
    { latitude: 41.00703194, longitude: -76.44841603 },
    { latitude: 41.0070037, longitude: -76.4484965 },
  ];

  //const selectedPoints = [routeCoordinates[2], routeCoordinates[3], routeCoordinates[4]];

  // set up a useEffect to request permissions, fetch user location, and track location
  useEffect(() => {
    // request user location to use while app is running
    async function getPermissionsAndStartWatching() {
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
    if (!isRegionSet) {
      setRegion(newRegion);
      setIsRegionSet(true); // Mark that the region is set
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <MapView
        style={styles.map}
        initialRegion={region} // Set the initial region only once
        region={isRegionSet ? region : undefined} // After the initial set, use the region prop only
        //showsUserLocation={true}

        onRegionChangeComplete={handleRegionChangeComplete} // update the zoom level when the user changes it
      // minZoomLevel={16}
      >
        {/* Draw the path */}
        <Polyline
          coordinates={routeCoordinates}
          // or, for a select group of points from the container:
          //coordinates={selectedPoints}
          strokeWidth={10}
          strokeColor="blue"
        />
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

      {/* Button with icon in the center of the screen */}
      <Pressable style={styles.button} onPress={() => { }}>
        {/* <Text style={styles.centerButtonText}>Search</Text> */}
        <Link
          href={{
            pathname: "/pages/to",
          }}
          style={styles.buttonText}
        >
          Search
        </Link>
      </Pressable>
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
  button: {
    position: "absolute",
    top: "24%",
    right: "5%",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row", // Align the icon and text horizontally
    alignItems: "center",
    borderRadius: 5,
    borderColor: "black",
    borderWidth: 2,
  },
  buttonText: {
    color: "grey",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10, // Add space between icon and text
  },
});
