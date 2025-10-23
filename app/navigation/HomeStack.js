import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import AddVerseScreen from "../screens/AddVerseScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#6200EE" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddVerseScreen" component={AddVerseScreen} options={{ title: "Add Verse" }} />
    </Stack.Navigator>
  );
}
<Drawer.Screen name="Home View" component={HomeStack} />
