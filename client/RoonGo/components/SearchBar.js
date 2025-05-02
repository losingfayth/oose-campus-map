import { SafeAreaView, TextInput } from "react-native";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import React, { useState } from "react";
import SearchFilter from "./SearchFilter";

const SearchBar = ({
  customStyles,
  showIcon = true,
  searchFilterData,
  defaultFilterData = [],
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
        onFocus={() => {
          setShowList(true); // show list when focused
          onTypingChange && onTypingChange(input.length > 0);
        }}
        onChangeText={(text) => {
          console.log(text);
          setInput(text);
          setShowList(true); // Show list when typing
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
      {showList &&
        (input.length > 0 ||
          (input.length === 0 && defaultFilterData.length > 0)) && (
          <SearchFilter
            /**
             * Display no search filter if defaultFilterData is empty. If
             * defaultFilterData isn't empty display defaultFilterData
             */
            data={
              input.length === 0 // if user hasn't typed
                ? defaultFilterData.length === 0 // then if default filter is empty
                  ? []
                  : defaultFilterData
                : searchFilterData
            }
            input={input}
            setInput={(text) => {
              setInput(text);
              onSelect(text);
              setShowList(false);
              onTypingChange && onTypingChange(false);
            }}
            customStyles={searchFilterStyles}
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
