// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import colors from '../../constants/colors';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>

     <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007bff",
          tabBarShowLabel: false,

          tabBarStyle: {
            paddingTop: 8,
            color: "black",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,

            height: 60,
            elevation: 5,
            marginHorizontal: 10,
            marginBottom: 10,
          },

          tabBarInactiveTintColor: "#6c757d",

          tabBarIcon: ({ color, size, focused }) => {
            switch (route.name) {
              case "index":
                return <AntDesign name="home" size={focused ? 28 : 24} color={color} />;
              case "add":
                return <AntDesign name="book" size={focused ? 28 : 24} color={color} />;
              case "stats":
                return (
                  <MaterialCommunityIcons
                    name="cards-outline"
                    size={focused ? 28 : 24}
                    color={color}
                  />
                );
              
             
              default:
                return <AntDesign name="question" size={focused ? 28 : 24} color={color} />;
            }
          },
        })}
      >
    
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="add" options={{ title: "Add" }} />
        <Tabs.Screen name="stats" options={{ title: "Stats" }} />
      </Tabs>
    </View>
  );
}
