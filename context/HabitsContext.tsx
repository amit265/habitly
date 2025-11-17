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
  repeatDays: number[];
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
  | { type: "RESET"; payload?: never };

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
};

const defaultContext: ContextType = {
  state: initialState,
  addHabit: async () => {},
  updateHabit: async () => {},
  deleteHabit: async () => {},
  reload: async () => {},
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

  // actions
  const addHabit = async (h: Habit) => {
    dispatch({ type: "ADD", payload: h });
    await persist([h, ...state.habits]);
  };

  const updateHabit = async (h: Habit) => {
    dispatch({ type: "UPDATE", payload: h });
    const next = state.habits.map((x) => (x.id === h.id ? h : x));
    await persist(next);
  };

  const deleteHabit = async (id: string) => {
    dispatch({ type: "DELETE", payload: id });
    const next = state.habits.filter((x) => x.id !== id);
    await persist(next);
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
    <HabitsContext.Provider value={{ state, addHabit, updateHabit, deleteHabit, reload }}>
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
      repeatDays: Array.isArray(p.repeatDays) ? p.repeatDays.map(Number) : [1,2,3,4,5],
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
