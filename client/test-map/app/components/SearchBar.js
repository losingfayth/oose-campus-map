import { SafeAreaView, TextInput } from "react-native";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import React, { useState } from "react";
import SearchFilter from "./SearchFilter";

const SearchBar = ({
  customStyles,
  showIcon = true,
  searchFilterData,
  searchFilterStyles,
  placeholderText = "Search",
  onTypingChange, // New prop to notify App.js when typing starts or stops
  onSelect, // Add onSelect prop
}) => {
  const [input, setInput] = useState("");
  const [showList, setShowList] = useState(false); // Control visibility of FlatList

  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.container, customStyles])}
      keyBoardShouldPersistTaps="handled"
    >
      {showIcon && (
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
      )}
      <TextInput
        value={input}
        onChangeText={(text) => {
          setInput(text);
          setShowList(text.length > 0); // Show list when typing
          onTypingChange && onTypingChange(text.length > 0); // Notify parent when user starts/stops typing
        }}
        onBlur={() => {
          setShowList(false);
          onTypingChange && onTypingChange(false); // Hide list and notify parent when input loses focus
        }}
        style={styles.searchInput}
        placeholder={placeholderText}
        clearButtonMode="always"
      />
      {showList && (
        <SearchFilter
          data={searchFilterData}
          input={input}
          setInput={(text) => {
            setInput(text);
            onSelect(text);
            console.log("Text---->", text);
            setShowList(false); // Hide list when an item is selected
            onTypingChange && onTypingChange(false); // Notify parent that typing has stopped
          }}
          customStyles={searchFilterStyles}
          //onSelect={handleSelect} // Pass handleSelect to SearchFilter
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: "60%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 0,
    borderColor: "black",
    borderWidth: 2,
    position: "absolute",
    top: "10%",
    left: "5%",
    justifyContent: "center",
    autoCorrect: "true",
  },
  searchInput: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingLeft: 8,
    fontSize: 16,
  },
  searchIcon: {
    padding: 10,
  },
});

export default SearchBar;
