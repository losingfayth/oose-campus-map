import { FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const SearchFilter = ({data, input, setInput}) => 
{
  return (
    <View style={styles.container} >
      {/* <Text>Text goes here</Text> */}
      <FlatList data={data} renderItem={({item}) => 
      {
        if(input === "")
        {
          return (
            <View style={{marginVertical: 10, marginLeft: 10}}>
                <Text style={{fontSize: 16}}>{item.name}</Text>
            </View>  
          )
        }
        // else
        // {

        // }

        // if user's search in lower case === what we have in our table,
        // then update the text in the suggested word box accordingly
        if(item.name.toLowerCase().includes(input.toLowerCase()))
        {
          return (
            <View style={{marginVertical: 10, marginLeft: 10}}>
              <Text style={{fontSize: 16}}>{item.name}</Text>
            </View>  
          )
        }

      }}/>
    </View>
  )
}

export default SearchFilter

const styles = StyleSheet.create 
({
    container: 
    {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20, 
        marginTop: 5, 
        width: '88%', 
        backgroundColor: 'white',
        borderRadius: 8,
        borderColor: "white",
        borderWidth: 2,
        position: 'absolute',
        top: '60',
        left: '15',
        justifyContent: 'center', 
        autoCorrect: "true",
        
    }
});