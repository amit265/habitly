// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#111",
          tabBarInactiveTintColor: "#888",

        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#111" : "#888"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (

              <View style={styles.addButtonWrapper} pointerEvents="box-none">
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.addButton}
                >
                  <Ionicons name="add" size={34} color="#fff" />
                </TouchableOpacity>
              </View>
            ),

          }}
        />

        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "stats-chart" : "stats-chart-outline"}
                size={24}
                color={focused ? "#111" : "#888"}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    borderTopWidth: 0,
    backgroundColor: "#fff",
    paddingTop: 8,
    color: "black",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 5,
    marginHorizontal: 10,
    marginBottom: 10,


    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: -28,
    left: 0,
    right: 0,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
