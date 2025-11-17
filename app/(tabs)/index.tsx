// app/(tabs)/index.tsx
import React from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useHabits } from "../../hooks/useHabits";
import type { Habit } from "../../context/HabitsContext";
import SafeScreen from "../../components/SafeScreen";

/**
 * Small helper to get today's ISO date string 'YYYY-MM-DD'
 */
function getTodayDate(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function getTimeOfDayGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}

export default function HomeScreen() {
    const router = useRouter();
    const { loaded, todayHabits } = useHabits();
    const todayDate = getTodayDate();

    // helper to check if a habit already has a record for today
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
                <Text style={styles.greeting}>{`${getTimeOfDayGreeting()}`}, Amit 👋</Text>
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
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push(`/edit/${item.id}`)}
                                activeOpacity={0.8}
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
});
