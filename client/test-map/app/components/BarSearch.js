import { useState } from "react";
import { SafeAreaView, TextInput } from "react-native";
import { StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 *  For testing a search bar WITH an API
 */

// const [searchQuery, setSearchQuery] = useState("");

// const handleSearch = (query) => 
// {
//     setSearchQuery(query);
// }

const BarSearch = () =>
{
    return(
        <SafeAreaView style={styles.container}>
            <TextInput style = {styles.searchInput} 
                placeholder="Search" 
                clearButtonMode='always'
                // onChangeText={(query) => handleSearch(query)}    
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create 
({
    container: 
    {
        flex: 1,
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
        width: '100%',
        height: '100%',
        paddingLeft: 8,
        fontSize: 16,
    }
});

export default BarSearch;
