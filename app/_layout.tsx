// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import colors from '../constants/colors';

// Replace this import with the actual path where you implement HabitsContext / provider.
// If you haven't created it yet, create a provider at /context/HabitsContext.tsx that exports `HabitsProvider`.
// import { HabitsProvider } from '../context/HabitsContext';

export default function RootLayout() {
  return (
      <SafeAreaProvider style={styles.flex}>
        {/* <HabitsProvider> */}
          <View style={styles.flex}>
            {/* Slot renders child routes (e.g. (tabs)/_layout and other routes) */}
            <Slot />
            <StatusBar style="auto" />
          </View>
        {/* </HabitsProvider> */}
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.BACKGROUND
  },
});
