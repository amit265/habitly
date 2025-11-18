// src/hooks/useHabits.ts
import { useMemo } from "react";
import { useHabitsContext } from "../context/HabitsContext";

/**
 * Thin helper exposing useful selectors derived from habits.
 */
export function useHabits() {
  const { state, addHabit, updateHabit, deleteHabit, reload, markHabitDay } = useHabitsContext();

  const todayHabits = useMemo(() => {
    const todayIndex = new Date().getDay(); // 0..6
    return state.habits.filter((h) => h.repeatDays.includes(todayIndex));
  }, [state.habits]);

  return {
    loaded: state.loaded,
    habits: state.habits,
    todayHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    reload,
    markHabitDay,
  };
}
