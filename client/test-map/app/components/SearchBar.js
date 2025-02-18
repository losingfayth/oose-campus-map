import { SafeAreaView, TextInput } from "react-native";
import { StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import React, { useState } from "react";
import { searchables } from './test/Words';
import SearchFilter from "./SearchFilter";



/**
 *  For testing the search bar and filtering without an API
 */


const SearchBar = () =>
{
    const [input, setInput] = useState("");
    //console.log(input)
    return(
        <SafeAreaView style={styles.container}>
            <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput value={input}
                onChangeText={(text) => setInput(text)}
                style = {styles.searchInput} 
                placeholder="Search" 
                clearButtonMode='always'
            />
            <SearchFilter data={searchables} input={input} setInput={setInput}/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create 
({
    container: 
    {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20, 
        width: '75%', 
        height: 50, 
        backgroundColor: 'white',
        borderRadius: 8,
        borderColor: "#ccc",
        borderWidth: 2,
        position: 'absolute',
        top: '10%',
        justifyContent: 'center', 
        autoCorrect: "true",
        
    }, 
    searchInput:
    {
        flex: 1,
        width: '100%',
        height: '100%',
        paddingLeft: 8,
        fontSize: 16,
    }, 
    searchIcon: 
    {
        padding: 10,
    },
});

export default SearchBar;
