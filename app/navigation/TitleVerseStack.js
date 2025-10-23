import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ViewTitlesScreen from "../screens/ViewTitlesScreen";
import ViewVersesByTitleScreen from "../screens/ViewVersesByTitleScreen";



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function TitleVerseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#6200EE" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="ViewTitles" component={ViewTitlesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ViewVersesByTitle" component={ViewVersesByTitleScreen} options={{ title: "Verses by Titles" }} />
    </Stack.Navigator>
  );
}
<Drawer.Screen name="View Titles" component={TitleVerseStack} />