import { createHash } from 'node:crypto';
import type { AIProvider, ChatInput, FoodAnalysisInput, FoodAnalysisResult } from './provider';

// Deterministic stub for local dev and tests. Never hits the network.
// Values are derived from input so they are stable but realistic-ish.

const pickFoods = (seed: string): Array<[string, number, number, number, number]> => {
  const h = createHash('sha256').update(seed).digest();
  const set = [
    ['grilled chicken breast (150g)', 248, 46, 0, 5],
    ['white rice (200g cooked)', 260, 5, 57, 0.5],
    ['broccoli (100g)', 35, 2.8, 7, 0.4],
    ['olive oil (1 tbsp)', 119, 0, 0, 14],
    ['apple (medium)', 95, 0.5, 25, 0.3],
    ['banana (medium)', 105, 1.3, 27, 0.4],
    ['whole wheat bread (1 slice)', 80, 4, 14, 1],
    ['avocado (half)', 160, 2, 9, 15],
  ] as const;
  const count = (h[0] % 2) + 2; // 2 or 3 items
  const out: Array<[string, number, number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    out.push(set[(h[i + 1] ?? 0) % set.length] as [string, number, number, number, number]);
  }
  return out;
};

const round = (n: number) => Math.round(n * 10) / 10;

export const stubProvider: AIProvider = {
  name: 'stub',

  async analyzeFood(input: FoodAnalysisInput) {
    const seed = JSON.stringify({ t: input.text ?? '', u: input.imageUrl ?? '' });
    const picked = pickFoods(seed);

    const items = picked.map(([name, cal, prot, carbs, fat]) => ({
      name,
      quantity: null,
      calories: cal,
      protein: prot,
      carbs,
      fat,
      confidence: 0.7,
    }));

    const totals = items.reduce(
      (acc, it) => ({
        calories: round(acc.calories + it.calories),
        protein: round(acc.protein + it.protein),
        carbs: round(acc.carbs + it.carbs),
        fat: round(acc.fat + it.fat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const data: FoodAnalysisResult = { items, totals, confidence: 0.7 };

    return {
      data,
      model: 'stub-food-v1',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
    };
  },

  async chat(input: ChatInput) {
    const lastUser = [...input.messages].reverse().find((m) => m.role === 'user');
    const prompt = lastUser?.content ?? '';
    const reply = prompt
      ? `Stubbed NutriAI reply: a balanced plate typically pairs lean protein, whole grains, and vegetables. (echo: "${prompt.slice(0, 120)}")`
      : 'Stubbed NutriAI reply: how can I help with your nutrition today?';

    return {
      data: { reply },
      model: 'stub-chat-v1',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
    };
  },
};
