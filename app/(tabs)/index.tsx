// app/(tabs)/index.tsx
import React from "react";
import {  View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import SafeScreen from "../../components/SafeScreen";
import { useHabits } from "../../hooks/useHabits";

export default function HomeScreen() {
  const router = useRouter();
  const { loaded, todayHabits } = useHabits();

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Habitly</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <Text style={styles.settings}>⚙️</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.sub}>Today</Text>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        {!loaded ? (
          <Text>Loading…</Text>
        ) : todayHabits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: "#666" }}>No habits for today — add one with the + button</Text>
          </View>
        ) : (
          <FlatList
            data={todayHabits}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                  <Text style={{ color: "#666", marginTop: 4 }}>
                    {item.goalType === "simple"
                      ? "Simple"
                      : item.goalType === "time"
                      ? `${item.goalValue ?? 0} min`
                      : `${item.goalValue ?? 0} times`}
                  </Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  settings: { fontSize: 20 },
  sub: { fontSize: 14, color: "#666", marginTop: 8, marginLeft: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  empty: {
    padding: 20,
    alignItems: "center",
  },
});
