import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function Building() {
  const router = useRouter();

  const { id, categories, currLoc, maxLocs } = useLocalSearchParams();
  const locs = JSON.parse(categories || "[]"); // Convert back to an array
  const currIndex = parseInt(currLoc);

  return (
    <View style={styles.container}>
      <Text>List of Buildings: {categories}</Text>
      <Text>Building ID: {id}</Text>
      <Text>Current Location in Array: {currLoc}</Text>
      <Text>Maximum Locations in Array: {maxLocs}</Text>
      <View style={styles.buttonContainer}>
        {/* Previous button (only if not at the first location) */}
        {currIndex > 0 && (
          <Button
            title="Previous"
            onPress={() => {
              router.push({
                pathname: `/buildings/${locs[currIndex - 1]}`,
                params: {
                  categories: JSON.stringify(locs),
                  currLoc: currIndex - 1,
                  maxLocs,
                },
              });
            }}
          />
        )}

        {/* Next button (only if there are more locations) */}
        {currIndex < maxLocs && (
          <Button
            title="Next"
            onPress={() => {
              router.push({
                pathname: `/buildings/${locs[currIndex + 1]}`,
                params: {
                  categories: JSON.stringify(locs),
                  currLoc: currIndex + 1,
                  maxLocs,
                },
              });
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
