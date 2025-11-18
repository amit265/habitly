// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
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

              focused ? <Entypo
                name={"circle-with-plus"}
                size={30}
                color={"#111"}
              /> : <AntDesign name="plus-circle" size={26} color="#888" />
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,



  },
});
