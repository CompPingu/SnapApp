import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "./src/screens/HomeScreen";
import { ScanFoodScreen } from "./src/screens/ScanFoodScreen";
import { ManualAddScreen } from "./src/screens/ManualAddScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { theme } from "./src/ui/theme";

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
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: theme.colors.bg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: "800",
            fontSize: 17,
          },
          headerTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.bgCard,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingTop: 4,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarIcon: ({ color, size }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              Home: "home",
              Scan: "scan",
              Manual: "add-circle",
              History: "time",
            };
            const name = map[route.name] || "apps";
            return <Ionicons name={name} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Scan"
          component={ScanFoodScreen}
          options={{ title: "Scan Food" }}
        />
        <Tab.Screen
          name="Manual"
          component={ManualAddScreen}
          options={{ title: "Manual Add" }}
        />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
