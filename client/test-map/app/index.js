import { Pressable, StyleSheet, Text, View, StatusBar } from "react-native";
import { Link, Redirect, router } from "expo-router";
import React from "react";

export default function index() {
  return <Redirect href={"/pages/App"} />;
  // return (
  //   <View>
  //     <StatusBar hidden={true} />
  //     <Text>index</Text>
  //     <Link href={"/pages/from"}>Go to from</Link>
  //     <Pressable onPress={() => router.push("/pages/App")}>
  //       <Text>Go to Map</Text>
  //     </Pressable>
  //   </View>
  // );
}

const styles = StyleSheet.create({});
