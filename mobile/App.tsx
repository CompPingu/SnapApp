import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "./src/screens/HomeScreen";
import { ScanFoodScreen } from "./src/screens/ScanFoodScreen";
import { ManualAddScreen } from "./src/screens/ManualAddScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";

export type RootTabsParamList = {
  Home: undefined;
  Scan: undefined;
  Manual: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabsParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Scan" component={ScanFoodScreen} options={{ title: "Scan Food" }} />
        <Tab.Screen name="Manual" component={ManualAddScreen} options={{ title: "Manual Add" }} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


