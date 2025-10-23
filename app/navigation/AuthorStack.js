import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ViewAuthorsScreen from "../screens/ViewAuthorsScreen";
import ViewVersesByAuthorScreen from "../screens/ViewVersesByAuthorScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function AuthorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#6200EE" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="ViewAuthors" component={ViewAuthorsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ViewVersesByAuthor" component={ViewVersesByAuthorScreen} options={{ title: "Verses by Author" }} />
    </Stack.Navigator>
  );
}
<Drawer.Screen name="View Author" component={AuthorStack} />