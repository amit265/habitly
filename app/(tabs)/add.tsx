// app/(tabs)/add.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useRouter } from "expo-router";
import type { Habit as HabitType } from "../../context/HabitsContext";
import SafeScreen from "../../components/SafeScreen";
import { useHabits } from "../../hooks/useHabits";

type GoalType = "simple" | "time" | "count";

export default function AddHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabits();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏃");
  const [goalType, setGoalType] = useState<GoalType>("simple");
  const [goalValue, setGoalValue] = useState<string>("");
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>("08:00");
  const [saving, setSaving] = useState(false);

  const emojis = ["🏃", "📚", "🧘", "💧", "☕️", "📝", "🎸", "🚶", "🍎", "🛌", "🧹", "💪"];

  function toggleDay(dayIndex: number) {
    setRepeatDays((prev) => {
      if (prev.includes(dayIndex)) return prev.filter((d) => d !== dayIndex);
      return [...prev, dayIndex].sort((a, b) => a - b);
    });
  }

  function validateTimeString(t: string) {
    if (!t) return false;
    const m = t.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    return !!m;
  }

  function parseGoalValueInput(input: string): number | null {
    if (!input) return null;
    const n = Number(input);
    if (Number.isNaN(n)) return null;
    return Math.max(0, Math.floor(n));
  }

  async function onSave() {
    if (!name.trim()) {
      Alert.alert("Please enter a habit name");
      return;
    }
    if (reminderEnabled && !validateTimeString(reminderTime)) {
      Alert.alert("Reminder time must be in HH:MM format (24-hour)");
      return;
    }

    const parsedGoal = parseGoalValueInput(goalValue);

    if (goalType === "count" && (parsedGoal === null || parsedGoal <= 0)) {
      Alert.alert("Please enter a valid count goal (e.g. 10)");
      return;
    }

    if (goalType === "time" && (parsedGoal === null || parsedGoal <= 0)) {
      Alert.alert("Please enter time in minutes (e.g. 15)");
      return;
    }

    const newHabit: HabitType = {
      id: Date.now().toString(),
      name: name.trim(),
      emoji,
      goalType,
      goalValue: parsedGoal,
      repeatDays,
      reminder: reminderEnabled ? reminderTime : null,
      createdAt: new Date().toISOString(),
      streak: { current: 0, longest: 0 },
      history: [],
    };

    console.log(newHabit)
    try {
      setSaving(true);
      await addHabit(newHabit);
      // navigate back to tabs (home)
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Failed to add habit", err);
      Alert.alert("Failed to save habit. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleReminder() {
    setReminderEnabled((prev) => !prev);
    if (!reminderEnabled && !reminderTime) setReminderTime("08:00");
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.select({ ios: 0, android: 80 })}>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Add Habit</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Habit name</Text>
            <TextInput
              placeholder="e.g. Read for 30 minutes"
              value={name}
              onChangeText={setName}
              style={styles.input}
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Emoji</Text>
            <View style={styles.emojiRow}>
              {emojis.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[styles.emojiCell, emoji === e && styles.emojiSelected]}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helper}>
              Tap to choose. Selected: <Text style={{ fontSize: 18 }}>{emoji}</Text>
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Goal</Text>

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setGoalType("simple")}
                style={[styles.chip, goalType === "simple" && styles.chipActive]}
              >
                <Text style={goalType === "simple" ? styles.chipTextActive : styles.chipText}>Simple Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setGoalType("time")}
                style={[styles.chip, goalType === "time" && styles.chipActive]}
              >
                <Text style={goalType === "time" ? styles.chipTextActive : styles.chipText}>Time (min)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setGoalType("count")}
                style={[styles.chip, goalType === "count" && styles.chipActive]}
              >
                <Text style={goalType === "count" ? styles.chipTextActive : styles.chipText}>Count</Text>
              </TouchableOpacity>
            </View>

            {(goalType === "time" || goalType === "count") && (
              <TextInput
                placeholder={goalType === "time" ? "Minutes (e.g. 15)" : "Count (e.g. 10)"}
                keyboardType="number-pad"
                value={goalValue}
                onChangeText={setGoalValue}
                style={[styles.input, { marginTop: 10 }]}
              />
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Repeat days</Text>
            <View style={styles.weekRow}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, idx) => {
                const active = repeatDays.includes(idx);
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => toggleDay(idx)}
                    style={[styles.dayBox, active && styles.dayBoxActive]}
                  >
                    <Text style={active ? styles.dayTextActive : styles.dayText}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Reminder</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={toggleReminder} style={[styles.toggle, reminderEnabled && styles.toggleOn]}>
                <Text style={{ color: reminderEnabled ? "#fff" : "#111" }}>{reminderEnabled ? "On" : "Off"}</Text>
              </TouchableOpacity>

              <TextInput
                placeholder="HH:MM (24h)"
                value={reminderTime}
                onChangeText={setReminderTime}
                editable={reminderEnabled}
                style={[styles.input, { flex: 1, marginLeft: 12 }]}
              />
            </View>
            <Text style={styles.helper}>If reminder is on, use 24-hour format (e.g. 08:00)</Text>
          </View>

          <View style={{ marginTop: 18 }} />
          <TouchableOpacity onPress={onSave} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Habit"}</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emojiCell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  emojiSelected: {
    borderColor: "#111",
    backgroundColor: "#f7f7f7",
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  chipText: {
    color: "#111",
  },
  chipTextActive: {
    color: "#fff",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  dayBoxActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  dayText: {
    color: "#111",
  },
  dayTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  toggleOn: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  saveBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
