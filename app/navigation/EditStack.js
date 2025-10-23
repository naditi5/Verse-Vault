import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ViewEditVersesScreen from "../screens/ViewEditVersesScreen";
import EditVerseScreen from "../screens/EditVerseScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function EditStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#6200EE" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="ViewEditVerses" component={ViewEditVersesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditVerse" component={EditVerseScreen} options={{ title: "Edit Verse" }} />
    </Stack.Navigator>
  );
}
<Drawer.Screen name="EditStack" component={EditStack} />
