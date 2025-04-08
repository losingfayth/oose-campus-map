import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function from() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>From: </Text>
      <Text>Room #: </Text>
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
