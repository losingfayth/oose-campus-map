import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function from() {
  const router = useRouter();

  // Check if 'from' and 'room' are available in router.query
  const { from, room } = router.query || {};
  console.log("from---->", from);
  console.log("room---->", room);

  // If `from` or `room` are undefined, you can show a fallback message or handle it accordingly
  if (!from || !room) {
    return (
      <View style={styles.container}>
        <Text>No data passed from the previous screen.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>From: {from}</Text>
      <Text>Room #: {room}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
