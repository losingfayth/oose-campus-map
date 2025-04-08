import React, { useEffect, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  Pressable,
  Button,
} from "react-native";
import { Link } from "expo-router";
import * as Location from "expo-location";
import { routeCoordinates } from "./test/test-coords";

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

  const router = useRouter();

  const { id, categories, coords, currLoc, maxLocs } = useLocalSearchParams();
  const parsedPoints = coords ? JSON.parse(coords) : [];

  const locs = JSON.parse(categories || "[]"); // Convert back to an array
  const currIndex = parseInt(currLoc);
  // console.log("---->", parsedPoints[currIndex]);

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

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <MapView
        style={styles.map}
        region={region} // Directly control region without initialRegion
        // minZoomLevel={16} // Ensure minimum zoom level is appropriate
        onRegionChangeComplete={handleRegionChangeComplete} // update the zoom level when the user changes it
      >
        {/* Draw the path */}
        <Polyline
          coordinates={parsedPoints[currIndex]}
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
              source={require("../assets/cropped-huskie.png")}
              style={{ height: 40, width: 40 }}
            />
          </Marker>
        )}
      </MapView>

      {/* Previous button (only if not at the first location) */}
      {currIndex > 0 && (
        <View style={[styles.buttonWrapper, styles.leftButton]}>
          <Button
            title="Prev"
            onPress={() => {
              router.push({
                pathname: `/buildings/${locs[currIndex - 1]}`,
                params: {
                  categories: JSON.stringify(locs),
                  coords: JSON.stringify(parsedPoints),
                  currLoc: currIndex - 1,
                  maxLocs,
                },
              });
            }}
          />
        </View>
      )}

      <View style={[styles.buttonWrapper, styles.centerButton]}>
        <Button
          title="Home"
          onPress={() => {
            router.push({
              pathname: "../pages/Start",
              params: {
                categories: null,
                coords: null,
                currLoc: 0,
                maxLocs: 0,
              },
            });
          }}
        />
      </View>

      {/* Next button (only if there are more locations) */}
      {currIndex < maxLocs && (
        <View style={[styles.buttonWrapper, styles.rightButton]}>
          <Button
            title="Next"
            onPress={() => {
              router.push({
                pathname: `/buildings/${locs[currIndex + 1]}`,
                params: {
                  categories: JSON.stringify(locs),
                  coords: JSON.stringify(parsedPoints),
                  currLoc: currIndex + 1,
                  maxLocs,
                },
              });
            }}
          />
        </View>
      )}
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
  buttonWrapper: {
    position: "absolute",
    bottom: "10%",
  },
  leftButton: {
    left: "10%",
  },
  centerButton: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
  },
  rightButton: {
    right: "10%",
  },
});
