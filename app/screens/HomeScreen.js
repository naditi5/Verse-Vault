import React, { useEffect, useState } from "react";
import {  View, Text, FlatList, TouchableOpacity, StyleSheet} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import ViewVersesScreen from "./ViewVersesScreen";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container} edges={["top", "left", "right"]}>
      
      {/* Existing ViewVerses screen */}
      <View style={{ flex: 1 }}>
        <ViewVersesScreen navigation={navigation} />
      </View>

      {/* Floating Add (+) Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddVerseScreen")}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDE7F6" },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#5000c0ff",
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});