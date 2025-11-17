// app/edit/[id].tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useHabits } from "../../hooks/useHabits";
import type { Habit as HabitType } from "../../context/HabitsContext";
import SafeScreen from "../../components/SafeScreen";

type GoalType = "simple" | "time" | "count";

export default function EditHabitScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // expo-router helper
    const router = useRouter();
    const { habits, updateHabit, deleteHabit } = useHabits();

    const habit = habits.find((h) => h.id === id);

    // local state mirrors Add screen
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("🏃");
    const [goalType, setGoalType] = useState<GoalType>("simple");
    const [goalValue, setGoalValue] = useState<string>("");
    const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string>("08:00");
    const [saving, setSaving] = useState(false);

    // small emoji palette (same as Add)
    const emojis = ["🏃", "📚", "🧘", "💧", "☕️", "📝", "🎸", "🚶", "🍎", "🛌", "🧹", "💪"];

    useEffect(() => {
        if (!habit) return;
        setName(habit.name ?? "");
        setEmoji(habit.emoji ?? "🏃");
        setGoalType((habit.goalType as GoalType) ?? "simple");
        setGoalValue(habit.goalValue != null ? String(habit.goalValue) : "");
        setRepeatDays(Array.isArray(habit.repeatDays) ? habit.repeatDays : [1, 2, 3, 4, 5]);
        setReminderEnabled(Boolean(habit.reminder));
        setReminderTime(habit.reminder ?? "08:00");
    }, [habit]);

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
        if (!habit) {
            Alert.alert("Habit not found");
            return;
        }
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

        const updated: HabitType = {
            ...habit,
            name: name.trim(),
            emoji,
            goalType,
            goalValue: parsedGoal,
            repeatDays,
            reminder: reminderEnabled ? reminderTime : null,
        };

        try {
            setSaving(true);
            await updateHabit(updated);
            router.replace("/(tabs)");
        } catch (err) {
            console.error("Failed to update habit", err);
            Alert.alert("Failed to save habit. Try again.");
        } finally {
            setSaving(false);
        }
    }

    async function onDelete() {
        if (!habit) return;
        Alert.alert(
            "Delete habit",
            `Delete "${habit.name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteHabit(habit.id);
                            router.replace("/(tabs)");
                        } catch (err) {
                            console.error("Failed to delete", err);
                            Alert.alert("Failed to delete habit. Try again.");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    }

    if (!habit) {
        return (
            <SafeScreen >
                <Text>Habit not found.</Text>
                <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.backBtn}>
                    <Text style={{ color: "#fff" }}>Back</Text>
                </TouchableOpacity>
            </SafeScreen>
        );
    }

    return (
        <SafeScreen>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: undefined })}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.header}>Edit Habit</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Habit name</Text>
                        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Habit name" />
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
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Goal</Text>
                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => setGoalType("simple")} style={[styles.chip, goalType === "simple" && styles.chipActive]}>
                                <Text style={goalType === "simple" ? styles.chipTextActive : styles.chipText}>Simple</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGoalType("time")} style={[styles.chip, goalType === "time" && styles.chipActive]}>
                                <Text style={goalType === "time" ? styles.chipTextActive : styles.chipText}>Time (min)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGoalType("count")} style={[styles.chip, goalType === "count" && styles.chipActive]}>
                                <Text style={goalType === "count" ? styles.chipTextActive : styles.chipText}>Count</Text>
                            </TouchableOpacity>
                        </View>

                        {(goalType === "time" || goalType === "count") && (
                            <TextInput
                                value={goalValue}
                                onChangeText={setGoalValue}
                                keyboardType="number-pad"
                                placeholder={goalType === "time" ? "Minutes (e.g. 15)" : "Count (e.g. 10)"}
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
                                    <TouchableOpacity key={d} onPress={() => toggleDay(idx)} style={[styles.dayBox, active && styles.dayBoxActive]}>
                                        <Text style={active ? styles.dayTextActive : styles.dayText}>{d}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Reminder</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <TouchableOpacity onPress={() => setReminderEnabled((s) => !s)} style={[styles.toggle, reminderEnabled && styles.toggleOn]}>
                                <Text style={{ color: reminderEnabled ? "#fff" : "#111" }}>{reminderEnabled ? "On" : "Off"}</Text>
                            </TouchableOpacity>

                            <TextInput
                                value={reminderTime}
                                onChangeText={setReminderTime}
                                editable={reminderEnabled}
                                style={[styles.input, { flex: 1, marginLeft: 12 }]}
                                placeholder="HH:MM (24h)"
                            />
                        </View>
                    </View>

                    <View style={{ height: 8 }} />
                    <TouchableOpacity onPress={onSave} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
                        <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>

                    <View style={{ height: 12 }} />
                    <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                        <Text style={{ color: "#fff", fontWeight: "700" }}>Delete habit</Text>
                    </TouchableOpacity>

                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
    field: { marginBottom: 16 },
    label: { fontSize: 13, color: "#333", marginBottom: 8 },
    input: { borderWidth: 1, borderColor: "#eee", padding: 12, borderRadius: 8, backgroundColor: "#fff" },
    emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    emojiCell: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#eee", alignItems: "center", justifyContent: "center", marginRight: 8, marginBottom: 8 },
    emojiSelected: { borderColor: "#111", backgroundColor: "#f7f7f7" },
    row: { flexDirection: "row", gap: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginRight: 8 },
    chipActive: { backgroundColor: "#111", borderColor: "#111" },
    chipText: { color: "#111" },
    chipTextActive: { color: "#fff" },
    weekRow: { flexDirection: "row", justifyContent: "space-between" },
    dayBox: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#eee" },
    dayBoxActive: { backgroundColor: "#111", borderColor: "#111" },
    dayText: { color: "#111" },
    dayTextActive: { color: "#fff", fontWeight: "600" },
    toggle: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#eee" },
    toggleOn: { backgroundColor: "#111", borderColor: "#111" },
    saveBtn: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    deleteBtn: { backgroundColor: "#e53935", paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
    backBtn: { marginTop: 12, backgroundColor: "#111", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
});
