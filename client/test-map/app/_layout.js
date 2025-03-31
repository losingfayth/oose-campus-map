import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pages/App" />
      <Stack.Screen name="pages/Start" />
      <Stack.Screen name="pages/from" />
      <Stack.Screen name="buildings/[id]" />
    </Stack>
  );
}

const styles = StyleSheet.create({});
