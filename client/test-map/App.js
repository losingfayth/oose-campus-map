import React, { useEffect, useState } from 'react';
import MapView, {Marker, Polyline} from 'react-native-maps';
import { StyleSheet, View, Image} from 'react-native';
import * as Location from 'expo-location';
import SearchBar from './app/components/SearchBar';
import BarSearch from './app/components/BarSearch';

export default function App() {

  const [location, setLocation] = useState(null)
  const [subscription, setTracker] = useState(null);
  const [region, setRegion] = useState(null);

  const routeCoordinates = [
    // Apple maps
    // { latitude: 41.006960, longitude: -76.448590 }, // Point a
    // { latitude: 41.007050, longitude: -76.448650 }, // Point b
    // { latitude: 41.007150, longitude: -76.448610 }, 
    // { latitude: 41.007230, longitude: -76.448520 }, // Point c
    // { latitude: 41.007249, longitude: -76.448466 }, // Point d
    { latitude: 41.006900, longitude: -76.449110 }, // first
    { latitude: 41.006774, longitude: -76.449009 }, 
    { latitude: 41.006975, longitude: -76.448576 }, 
    { latitude: 41.007099, longitude: -76.448645 }, 
    { latitude: 41.007242, longitude: -76.448531 }, 
    { latitude: 41.007249, longitude: -76.448466 }, 
    { latitude: 41.007319, longitude: -76.448316 }, 
    { latitude: 41.007191, longitude: -76.448214 }, 
    { latitude: 41.007175, longitude: -76.448248 }, 
    { latitude: 41.007099, longitude: -76.448306 }, 
    { latitude: 41.006990, longitude: -76.448220 }, 
    { latitude: 41.006980, longitude: -76.448245 }, // last
  ];

  //const selectedPoints = [routeCoordinates[2], routeCoordinates[3], routeCoordinates[4]];

  // set up a useEffect to request permissions, fetch user location, and track location
  useEffect(() => 
  {
    // request user location to use while app is running
    async function getPermissionsAndStartWatching()
    {
      // wait until we get permission granted or denied
      let{status} = await Location.requestForegroundPermissionsAsync()
      if(status !== 'granted')
      {
        console.log('Permission not granted')
        return;
      }

      // Get initial location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // Start watching position updates
      const newTracker = await Location.watchPositionAsync
      (
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10, // time in milliseconds
          distanceInterval: 1, // update after this many meters moved
        },
        (location_update) => 
        {
          //console.log('Updated location:', location_update.coords);
          setLocation(location_update.coords);
        }
      );
      setTracker(newTracker);
    }

    getPermissionsAndStartWatching();

    // Stop watching location when the app closes or user navigates to another screen
    return () => 
    {
      if (subscription) 
        {
        subscription.remove(); 
      }
    };
  }, []);   

  return (
    <View style={styles.container}>
      <MapView
        style = {styles.map}
        initialRegion={{
          latitude: 41.007681,
          longitude: -76.448487,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421,
        }}
        //showsUserLocation={true}

        minZoomLevel={16}
        onRegionChangeComplete={(newRegion) => setRegion((prev => ({
          ...prev,
          latitudeDelta: newRegion.latitudeDelta,
          longitudeDelta: newRegion.longitudeDelta,
        })))} // update the zoom level when the user changes it
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
              }}>
              <Image source={require('./assets/cropped-huskie.png')} style={{height: 40, width:40 }}/>
            </Marker>
          )}
      </MapView>

      {/* Add search bar */}
      {/* <Screen> */}
          <SearchBar />
          {/* <BarSearch /> */}
      {/* </Screen> */}

    </View>
  );

}

const styles = StyleSheet.create ({
  container:{
    ...StyleSheet.absoluteFillObject,
    justifyContent:'center',
    alignItems:'center'
  },
  map:{
    ...StyleSheet.absoluteFillObject,
  }
})

