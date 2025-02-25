import { Text, View } from "react-native";
import React from "react";

export default class Index extends React.Component {
  
state = {
  data: {'activity': 'Loading...' }
};

getJsonData = () => {
  fetch('https://www.boredapi.com/api/activity/',
    {method: 'GET'}).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      this.setState({
        data: responseJson
      })
    })
  
};

componentDidMount = () => {
     this.getJsonData();
}

  render() {
    return (
      <View>
        <Text>{this.state.data['activity']}</Text>
      </View>
    );

    
  }

}
