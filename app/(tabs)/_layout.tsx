// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      // keep Tabs props minimal here to avoid any strange runtime mapping
      screenOptions={{ headerShown: false }} // keep only the most basic
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarShowLabel: false, // per-screen boolean
          tabBarStyle: {
            height: 68,
            borderTopWidth: 0,
          },
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏚️'}</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Text style={{ fontSize: 28 }}>{focused ? '➕' : '✚'}</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '📊' : '📈'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
