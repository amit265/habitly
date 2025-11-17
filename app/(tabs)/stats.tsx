// app/(tabs)/stats.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useHabits } from "../../hooks/useHabits";
import type { Habit } from "../../context/HabitsContext";
import SafeScreen from "../../components/SafeScreen";

/**
 * Helpers
 */
function getISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getLastNDates(n: number) {
  const arr: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    arr.push(getISODate(dt));
  }
  return arr;
}

export default function StatsScreen() {
  const { habits, loaded } = useHabits();

  // overall completion for today: percent of today's scheduled habits that are marked 'done'
  const today = getISODate(new Date());
  const todayHabits = useMemo(() => {
    const dayIdx = new Date().getDay();
    return habits.filter((h) => h.repeatDays.includes(dayIdx));
  }, [habits]);

  const todayCompletionPercent = useMemo(() => {
    if (todayHabits.length === 0) return 0;
    const doneCount = todayHabits.reduce((acc, h) => {
      const rec = (h.history || []).find((r) => r.date === today);
      if (!rec) return acc;
      return acc + (rec.status === "done" ? 1 : 0);
    }, 0);
    return Math.round((doneCount / todayHabits.length) * 100);
  }, [todayHabits, habits]);

  // streaks: compute max current and max longest across habits
  const streaks = useMemo(() => {
    let maxCurrent = 0;
    let maxLongest = 0;
    habits.forEach((h) => {
      if (h.streak?.current && h.streak.current > maxCurrent) maxCurrent = h.streak.current;
      if (h.streak?.longest && h.streak.longest > maxLongest) maxLongest = h.streak.longest;
    });
    return { maxCurrent, maxLongest };
  }, [habits]);

  // 7-day summary: for each date, compute percent done among habits scheduled that date
  const last7 = useMemo(() => getLastNDates(7), []);
  const last7Data = useMemo(() => {
    return last7.map((date) => {
      const dayIdx = new Date(date).getDay();
      const scheduled = habits.filter((h) => h.repeatDays.includes(dayIdx));
      if (scheduled.length === 0) return { date, percent: 0 };
      const doneCount = scheduled.reduce((acc, h) => {
        const rec = (h.history || []).find((r) => r.date === date);
        if (!rec) return acc;
        return acc + (rec.status === "done" ? 1 : 0);
      }, 0);
      return { date, percent: Math.round((doneCount / scheduled.length) * 100) };
    });
  }, [habits, last7]);

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Stats</Text>

        <View style={styles.metricCard}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>{todayCompletionPercent}%</Text>
          </View>
          <Text style={{ marginTop: 8, color: "#666" }}>Overall completion (today)</Text>
        </View>

        <View style={styles.streakRow}>
          <View style={styles.streakBox}>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakValue}>{streaks.maxCurrent}</Text>
          </View>

          <View style={styles.streakBox}>
            <Text style={styles.streakLabel}>Longest Streak</Text>
            <Text style={styles.streakValue}>{streaks.maxLongest}</Text>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Last 7 days</Text>
          <View style={styles.barRow}>
            {last7Data.map((d) => (
              <View key={d.date} style={styles.barColumn}>
                <View style={[styles.bar, { height: Math.max(6, (d.percent / 100) * 80) }]} />
                <Text style={styles.barLabel}>{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "#666" }}>Most consistent / Least consistent</Text>
          {/* simple heuristics: choose by longest / shortest longest streak */}
          <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
            <Text>Most consistent: {getMostConsistent(habits)?.name ?? "—"}</Text>
            <Text>Least consistent: {getLeastConsistent(habits)?.name ?? "—"}</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeScreen>
  );
}

/** very small heuristics for consistency */
function getMostConsistent(habits: Habit[]) {
  if (!habits || habits.length === 0) return null;
  let best: Habit | null = null;
  habits.forEach((h) => {
    if (!best || (h.streak?.longest ?? 0) > (best.streak?.longest ?? 0)) best = h;
  });
  return best;
}
function getLeastConsistent(habits: Habit[]) {
  if (!habits || habits.length === 0) return null;
  let worst: Habit | null = null;
  habits.forEach((h) => {
    if (!worst || (h.streak?.longest ?? Infinity) < (worst.streak?.longest ?? Infinity)) worst = h;
  });
  return worst;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  metricCard: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { fontSize: 24, fontWeight: "700" },
  streakRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  streakBox: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  streakLabel: { color: "#666", marginBottom: 6 },
  streakValue: { fontSize: 18, fontWeight: "700" },
  barRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  barColumn: { alignItems: "center", flex: 1, marginHorizontal: 4 },
  bar: { width: "100%", backgroundColor: "#111", borderRadius: 4 },
  barLabel: { marginTop: 6, fontSize: 12, color: "#666" },
});
