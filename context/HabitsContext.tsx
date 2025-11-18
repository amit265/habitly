// src/context/HabitsContext.tsx
import React, { createContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type GoalType = "simple" | "time" | "count";
export type DoneStatus = "done" | "skip" | "partial";

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  goalType: GoalType;
  goalValue?: number | null;
  repeatDays: number[]; // 0..6
  reminder?: string | null;
  createdAt: string;
  streak: { current: number; longest: number };
  history?: Array<{ date: string; status: DoneStatus; value?: number }>;
};

type State = {
  loaded: boolean;
  habits: Habit[];
};

const STORAGE_KEY = "habitly:habits_v1";

const initialState: State = {
  loaded: false,
  habits: [],
};

/** Actions */
type Action =
  | { type: "LOAD"; payload: Habit[] }
  | { type: "ADD"; payload: Habit }
  | { type: "UPDATE"; payload: Habit }
  | { type: "DELETE"; payload: string }
  | { type: "RECORD"; payload: { habitId: string; date: string; status: DoneStatus; value?: number } }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { ...state, habits: action.payload, loaded: true };
    case "ADD":
      return { ...state, habits: [action.payload, ...state.habits] };
    case "UPDATE":
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };
    case "DELETE":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case "RECORD": {
      const { habitId, date, status, value } = action.payload;
      const nextHabits = state.habits.map((h) => {
        if (h.id !== habitId) return h;
        const history = Array.isArray(h.history) ? [...h.history] : [];
        // replace or add record for date
        const idx = history.findIndex((r) => r.date === date);
        const record = { date, status, value };
        if (idx >= 0) history[idx] = record;
        else history.push(record);
        // keep history sorted by date asc (not strictly required but helpful)
        history.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

        // recompute streaks based on new history and repeatDays
        const { current, longest } = computeStreaks(h.repeatDays, history);

        return { ...h, history, streak: { current, longest } };
      });
      return { ...state, habits: nextHabits };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/** Context shape */
type ContextType = {
  state: State;
  addHabit: (h: Habit) => Promise<void>;
  updateHabit: (h: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  markHabitDay: (habitId: string, date: string, status: DoneStatus, value?: number) => Promise<void>;
};

const defaultContext: ContextType = {
  state: initialState,
  addHabit: async () => {},
  updateHabit: async () => {},
  deleteHabit: async () => {},
  reload: async () => {},
  markHabitDay: async () => {},
};

const HabitsContext = createContext<ContextType>(defaultContext);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // load habits from storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (!raw) {
          dispatch({ type: "LOAD", payload: [] });
          return;
        }
        // safe parse
        const parsed = safeParseHabits(raw);
        dispatch({ type: "LOAD", payload: parsed });
      } catch (err) {
        console.error("HabitsProvider load error:", err);
        dispatch({ type: "LOAD", payload: [] });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // persist helper
  async function persist(habits: Habit[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (err) {
      console.error("Failed to persist habits:", err);
    }
  }

 /* Replace addHabit, updateHabit, deleteHabit, markHabitDay with the following implementations */

  // actions
  const addHabit = async (h: Habit) => {
    // compute next first
    const next = [h, ...state.habits];
    // persist next then dispatch load so both storage & state are consistent
    await persist(next);
    dispatch({ type: "LOAD", payload: next });
  };

  const updateHabit = async (h: Habit) => {
    // create next array by mapping current state and replacing the item
    const next = state.habits.map((x) => (x.id === h.id ? h : x));
    await persist(next);
    // dispatch LOAD so state mirrors persisted data
    dispatch({ type: "LOAD", payload: next });
  };

  const deleteHabit = async (id: string) => {
    const next = state.habits.filter((x) => x.id !== id);
    await persist(next);
    dispatch({ type: "LOAD", payload: next });
  };

  // Mark a habit for a specific date with status (safer, atomic)
  const markHabitDay = async (habitId: string, date: string, status: DoneStatus, value?: number) => {
    // Build the next habits array deterministically from current state
    const next = state.habits.map((h) => {
      if (h.id !== habitId) return h;
      const history = Array.isArray(h.history) ? [...h.history] : [];
      const idx = history.findIndex((r) => r.date === date);
      const record = { date, status, value } as { date: string; status: DoneStatus; value?: number };
      if (idx >= 0) history[idx] = record;
      else history.push(record);
      history.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      const { current, longest } = computeStreaks(h.repeatDays, history);
      return { ...h, history, streak: { current, longest } };
    });

    // Persist the next snapshot then dispatch LOAD so both storage & context match
    await persist(next);
    dispatch({ type: "LOAD", payload: next });
  };


  const reload = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? safeParseHabits(raw) : [];
      dispatch({ type: "LOAD", payload: parsed });
    } catch (err) {
      console.error("reload error", err);
    }
  };

  return (
    <HabitsContext.Provider value={{ state, addHabit, updateHabit, deleteHabit, reload, markHabitDay }}>
      {children}
    </HabitsContext.Provider>
  );
};

export function useHabitsContext() {
  const ctx = React.useContext(HabitsContext);
  if (!ctx) throw new Error("useHabitsContext must be used inside HabitsProvider");
  return ctx;
}

/** Utility: safe parse and lightweight migration if needed */
function safeParseHabits(raw: string): Habit[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // sanitize items to expected shape (minimal)
    return parsed.map((p: any) => ({
      id: String(p.id ?? Date.now().toString()),
      name: String(p.name ?? "Unnamed"),
      emoji: String(p.emoji ?? "🏃"),
      goalType: (p.goalType === "time" || p.goalType === "count" ? p.goalType : "simple") as GoalType,
      goalValue: p.goalValue == null ? null : Number(p.goalValue),
      repeatDays: Array.isArray(p.repeatDays) ? p.repeatDays.map(Number) : [1, 2, 3, 4, 5],
      reminder: p.reminder ?? null,
      createdAt: String(p.createdAt ?? new Date().toISOString()),
      streak: {
        current: (p.streak && Number(p.streak.current)) || 0,
        longest: (p.streak && Number(p.streak.longest)) || 0,
      },
      history: Array.isArray(p.history) ? p.history : [],
    }));
  } catch (err) {
    console.warn("safeParseHabits parse error:", err);
    return [];
  }
}

/** --- Streak calculation helpers --- */
/**
 * Expect repeatDays: number[] of 0..6
 * history: array of {date: 'YYYY-MM-DD', status}
 *
 * We'll compute:
 * - current: consecutive scheduled days ending at today where status === 'done'
 * - longest: max consecutive scheduled-day runs in the last 365 days
 */
function getISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, delta: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return getISODate(d);
}

function computeStreaks(repeatDays: number[], history: Array<{ date: string; status: DoneStatus }>) {
  const today = getISODate(new Date());
  const historyMap = new Map<string, DoneStatus>();
  history.forEach((r) => historyMap.set(r.date, r.status));

  // helper to check if a date is scheduled
  function isScheduled(dateStr: string) {
    const day = new Date(dateStr + "T00:00:00").getDay();
    return repeatDays.includes(day);
  }

  // compute current streak: walk backwards from today up to 365 days
  let current = 0;
  for (let i = 0; i < 365; i++) {
    const d = addDays(today, -i);
    if (!isScheduled(d)) continue; // not scheduled -> skip counting but don't break the streak (streak counts scheduled days only)
    const status = historyMap.get(d);
    if (status === "done") current++;
    else break; // scheduled day with not-done (skip/partial or missing) breaks streak
  }

  // compute longest streak over last 365 days
  let longest = 0;
  let running = 0;
  // iterate from 365 days ago to today
  for (let i = 365; i >= 0; i--) {
    const d = addDays(today, -i);
    if (!isScheduled(d)) {
      // not scheduled: reset running? NO — we want consecutive scheduled-day runs only.
      // so do not reset running when encountering non-scheduled days (they don't affect scheduled-day sequences).
      continue;
    }
    const status = historyMap.get(d);
    if (status === "done") {
      running++;
      if (running > longest) longest = running;
    } else {
      running = 0; // scheduled day that is not done breaks a consecutive run
    }
  }

  return { current, longest };
}
