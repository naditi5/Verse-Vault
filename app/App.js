import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SQLiteProvider } from "expo-sqlite";


import initializeDatabase from "../database/database";
import HomeStack from "./navigation/HomeStack";
import AuthorStack from "./navigation/AuthorStack";
import TitleVerseStack from "./navigation/TitleVerseStack";
import EditStack from "./navigation/EditStack";
import ViewVersesByTagsScreen from "./screens/ViewVersesByTagsScreen";
import ViewVersesByTimeScreen from "./screens/ViewVersesByTimeScreen";

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    // <NavigationContainer>
    <SQLiteProvider databaseName="verses.db" onInit={initializeDatabase}>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          drawerActiveTintColor: '#2196F3',
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen name="Home" component={HomeStack} />
        <Drawer.Screen name="Edit Verses" component={EditStack} />
        <Drawer.Screen name="Verses by Titles" component={TitleVerseStack} />
        <Drawer.Screen name="Verses by Authors" component={AuthorStack} />
        <Drawer.Screen name="Verses by Tags" component={ViewVersesByTagsScreen} />
        <Drawer.Screen name="Verses by Time" component={ViewVersesByTimeScreen} />
      </Drawer.Navigator>
    </SQLiteProvider>
      
    // </NavigationContainer>
  );
}
