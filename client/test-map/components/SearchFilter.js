import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const SearchFilter = ({ data, input, setInput, customStyles }) => {
  // Function to handle item press
  const handlePress = (item) => {
    console.log("User clicked:", item);
    setInput(item); // Update the search input with the clicked item's name
  };

  // Filter data based on user input
  const filteredData = data.filter((item) =>
    item.toLowerCase().includes(input.toLowerCase())
  );

  // If input is not empty and no matches, render nothing
  if (input !== "" && filteredData.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.flatten([styles.container, customStyles])}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={filteredData}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={{ marginVertical: 10, marginLeft: 10 }}>
              <Text style={{ fontSize: 16 }}>{item}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SearchFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 0,
    marginTop: 5,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "grey",
    borderWidth: 2,
    position: "absolute",
    top: 60, // Fixed incorrect string values
    // left: 15,
    justifyContent: "center",
    zIndex: 10, // Ensures it stays on top of other content
  },
});
