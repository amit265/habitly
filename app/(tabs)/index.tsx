// app/(tabs)/index.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useHabits } from "../../hooks/useHabits";
import type { Habit } from "../../context/HabitsContext";
import SafeScreen from "../../components/SafeScreen";

function getTodayDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const router = useRouter();
  const { loaded, todayHabits, markHabitDay } = useHabits();
  const todayDate = getTodayDate();

  async function handleMark(habitId: string, status: "done" | "skip" | "partial") {
    try {
      await markHabitDay(habitId, todayDate, status);
    } catch (err) {
      console.error("mark error", err);
      Alert.alert("Failed to update habit status. Try again.");
    }
  }

  console.log("Rendering HomeScreen, todayHabits:", todayHabits);
  console.log("Loaded status:", loaded);
  console.log("markhabitday", markHabitDay)

  function doneStatusForToday(h: Habit) {
    if (!h.history || h.history.length === 0) return "not";
    const rec = h.history.find((r) => r.date === todayDate);
    return rec ? rec.status : "not";
  }

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Text style={styles.title}>Habitly</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <Text style={styles.settings}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.subheader}>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
        <Text style={styles.greeting}>Good Morning, Amit 👋</Text>
      </View>

      <View style={styles.listWrap}>
        {!loaded ? (
          <Text style={styles.loading}>Loading…</Text>
        ) : todayHabits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: "#666", textAlign: "center" }}>No habits scheduled for today — add one with the + button</Text>
          </View>
        ) : (
          <FlatList
            data={todayHabits}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              // <-- TouchableOpacity wraps the card so taps navigate to Edit
              <TouchableOpacity
                onPress={() => router.push(`/edit/${item.id}`)}
                activeOpacity={0.8}
                style={styles.card}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>
                    {item.goalType === "simple"
                      ? "Simple"
                      : item.goalType === "time"
                      ? `${item.goalValue ?? 0} min`
                      : `${item.goalValue ?? 0} times`}
                  </Text>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.streak}>{item.streak.current} 🔥</Text>
                  <Text style={styles.statusText}>{String(doneStatusForToday(item))}</Text>

                  <View style={{ flexDirection: "row", marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleMark(item.id, "done")}
                      style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
                    >
                      <Text style={styles.actionText}>Done</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleMark(item.id, "skip")}
                      style={[styles.actionBtn, { backgroundColor: "#f59e0b", marginLeft: 8 }]}
                    >
                      <Text style={styles.actionText}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleMark(item.id, "partial")}
                      style={[styles.actionBtn, { backgroundColor: "#0ea5e9", marginLeft: 8 }]}
                    >
                      <Text style={styles.actionText}>Partial</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  settings: { fontSize: 20 },
  subheader: { paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  dateText: { color: "#666" },
  greeting: { fontSize: 16, marginTop: 4 },
  listWrap: { flex: 1, paddingHorizontal: 16 },
  loading: { marginTop: 24, color: "#666" },
  empty: { marginTop: 24, alignItems: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  emoji: { fontSize: 28 },
  cardBody: { marginLeft: 12, flex: 1 },
  cardTitle: { fontWeight: "700" },
  cardSub: { marginTop: 4, color: "#666" },
  cardRight: { alignItems: "flex-end" },
  streak: { fontSize: 14, color: "#111" },
  statusText: { marginTop: 6, color: "#666", fontSize: 12 },

  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
