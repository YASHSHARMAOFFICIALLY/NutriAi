"use client";

import { useProfile, useDailySummary } from "@/lib/hooks/swr";

export interface MacroQuad {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function sumMacros<T extends MacroQuad>(items: T[]): MacroQuad {
  return items.reduce<MacroQuad>(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function useTargets(): MacroQuad {
  const { data: profile } = useProfile();
  return {
    calories: profile?.effectiveCalorieTarget ?? profile?.dailyCalorieTarget ?? 0,
    protein: profile?.effectiveProteinTargetG ?? profile?.proteinTargetG ?? 0,
    carbs: profile?.effectiveCarbsTargetG ?? profile?.carbsTargetG ?? 0,
    fat: profile?.effectiveFatTargetG ?? profile?.fatTargetG ?? 0,
  };
}

export function useRemaining(date?: string): MacroQuad {
  const targets = useTargets();
  const { data: summary } = useDailySummary(date);
  const consumed: MacroQuad = {
    calories: summary?.totalCalories ?? 0,
    protein: summary?.totalProtein ?? 0,
    carbs: summary?.totalCarbs ?? 0,
    fat: summary?.totalFat ?? 0,
  };
  return {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs: Math.max(0, targets.carbs - consumed.carbs),
    fat: Math.max(0, targets.fat - consumed.fat),
  };
}
