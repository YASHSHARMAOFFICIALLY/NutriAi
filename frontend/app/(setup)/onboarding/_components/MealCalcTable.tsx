"use client";

import { useMemo, useState } from "react";
import { Plus, Trash, CaretDown, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

// ── Common Indian + global food database (per standard serving) ──────────────

interface FoodEntry {
  name: string;
  category: string;
  servingLabel: string;
  caloriesPer: number;
  proteinPer: number;
  carbsPer: number;
  fatPer: number;
}

const FOOD_DB: FoodEntry[] = [
  // Staples
  { name: "Rice (cooked)", category: "Staples", servingLabel: "1 cup (180g)", caloriesPer: 210, proteinPer: 4, carbsPer: 46, fatPer: 0.4 },
  { name: "Roti / Chapati", category: "Staples", servingLabel: "1 piece", caloriesPer: 120, proteinPer: 3, carbsPer: 20, fatPer: 3.5 },
  { name: "Paratha (plain)", category: "Staples", servingLabel: "1 piece", caloriesPer: 200, proteinPer: 4, carbsPer: 28, fatPer: 8 },
  { name: "Bread slice", category: "Staples", servingLabel: "1 slice", caloriesPer: 80, proteinPer: 3, carbsPer: 14, fatPer: 1 },
  { name: "Poha", category: "Staples", servingLabel: "1 cup", caloriesPer: 250, proteinPer: 5, carbsPer: 42, fatPer: 7 },
  { name: "Idli", category: "Staples", servingLabel: "1 piece", caloriesPer: 60, proteinPer: 2, carbsPer: 12, fatPer: 0.4 },
  { name: "Dosa (plain)", category: "Staples", servingLabel: "1 piece", caloriesPer: 130, proteinPer: 3, carbsPer: 22, fatPer: 3.5 },
  { name: "Upma", category: "Staples", servingLabel: "1 cup", caloriesPer: 210, proteinPer: 5, carbsPer: 32, fatPer: 7 },
  { name: "Oats (cooked)", category: "Staples", servingLabel: "1 cup", caloriesPer: 150, proteinPer: 5, carbsPer: 27, fatPer: 2.5 },

  // Dal & Legumes
  { name: "Dal (any)", category: "Dal & Legumes", servingLabel: "1 cup", caloriesPer: 180, proteinPer: 12, carbsPer: 28, fatPer: 2 },
  { name: "Rajma curry", category: "Dal & Legumes", servingLabel: "1 cup", caloriesPer: 210, proteinPer: 13, carbsPer: 30, fatPer: 4 },
  { name: "Chole / Chana", category: "Dal & Legumes", servingLabel: "1 cup", caloriesPer: 240, proteinPer: 12, carbsPer: 34, fatPer: 6 },
  { name: "Sprouts salad", category: "Dal & Legumes", servingLabel: "1 cup", caloriesPer: 100, proteinPer: 7, carbsPer: 14, fatPer: 1 },

  // Protein
  { name: "Paneer (raw)", category: "Protein", servingLabel: "100g", caloriesPer: 265, proteinPer: 18, carbsPer: 4, fatPer: 20 },
  { name: "Egg (boiled)", category: "Protein", servingLabel: "1 egg", caloriesPer: 78, proteinPer: 6, carbsPer: 0.6, fatPer: 5 },
  { name: "Chicken breast", category: "Protein", servingLabel: "100g", caloriesPer: 165, proteinPer: 31, carbsPer: 0, fatPer: 3.6 },
  { name: "Fish (grilled)", category: "Protein", servingLabel: "100g", caloriesPer: 140, proteinPer: 26, carbsPer: 0, fatPer: 3 },
  { name: "Tofu", category: "Protein", servingLabel: "100g", caloriesPer: 76, proteinPer: 8, carbsPer: 2, fatPer: 4.5 },
  { name: "Greek yogurt", category: "Protein", servingLabel: "1 cup", caloriesPer: 130, proteinPer: 12, carbsPer: 8, fatPer: 5 },
  { name: "Curd / Dahi", category: "Protein", servingLabel: "1 cup", caloriesPer: 100, proteinPer: 5, carbsPer: 8, fatPer: 5 },
  { name: "Whey protein scoop", category: "Protein", servingLabel: "1 scoop (30g)", caloriesPer: 120, proteinPer: 24, carbsPer: 3, fatPer: 1.5 },

  // Vegetables & Sabzi
  { name: "Mixed sabzi", category: "Vegetables", servingLabel: "1 cup", caloriesPer: 120, proteinPer: 3, carbsPer: 12, fatPer: 7 },
  { name: "Palak paneer", category: "Vegetables", servingLabel: "1 cup", caloriesPer: 230, proteinPer: 14, carbsPer: 8, fatPer: 16 },
  { name: "Aloo gobi", category: "Vegetables", servingLabel: "1 cup", caloriesPer: 180, proteinPer: 4, carbsPer: 22, fatPer: 9 },
  { name: "Salad (plain)", category: "Vegetables", servingLabel: "1 bowl", caloriesPer: 45, proteinPer: 2, carbsPer: 8, fatPer: 0.5 },

  // Fruits
  { name: "Banana", category: "Fruits", servingLabel: "1 medium", caloriesPer: 105, proteinPer: 1.3, carbsPer: 27, fatPer: 0.4 },
  { name: "Apple", category: "Fruits", servingLabel: "1 medium", caloriesPer: 95, proteinPer: 0.5, carbsPer: 25, fatPer: 0.3 },
  { name: "Mango", category: "Fruits", servingLabel: "1 cup sliced", caloriesPer: 100, proteinPer: 1, carbsPer: 25, fatPer: 0.6 },

  // Snacks
  { name: "Samosa", category: "Snacks", servingLabel: "1 piece", caloriesPer: 260, proteinPer: 4, carbsPer: 30, fatPer: 14 },
  { name: "Biscuit (cream)", category: "Snacks", servingLabel: "1 piece", caloriesPer: 67, proteinPer: 0.7, carbsPer: 9, fatPer: 3 },
  { name: "Namkeen / Mixture", category: "Snacks", servingLabel: "1 cup", caloriesPer: 350, proteinPer: 8, carbsPer: 40, fatPer: 18 },
  { name: "Peanuts", category: "Snacks", servingLabel: "¼ cup", caloriesPer: 210, proteinPer: 9, carbsPer: 6, fatPer: 18 },
  { name: "Protein bar", category: "Snacks", servingLabel: "1 bar", caloriesPer: 200, proteinPer: 20, carbsPer: 22, fatPer: 7 },

  // Drinks
  { name: "Chai (with milk + sugar)", category: "Drinks", servingLabel: "1 cup", caloriesPer: 90, proteinPer: 3, carbsPer: 12, fatPer: 3 },
  { name: "Black coffee", category: "Drinks", servingLabel: "1 cup", caloriesPer: 5, proteinPer: 0.3, carbsPer: 0, fatPer: 0 },
  { name: "Lassi (sweet)", category: "Drinks", servingLabel: "1 glass", caloriesPer: 170, proteinPer: 5, carbsPer: 28, fatPer: 4 },
  { name: "Milk (full fat)", category: "Drinks", servingLabel: "1 glass (250ml)", caloriesPer: 150, proteinPer: 8, carbsPer: 12, fatPer: 8 },
  { name: "Coconut water", category: "Drinks", servingLabel: "1 glass", caloriesPer: 46, proteinPer: 2, carbsPer: 9, fatPer: 0.5 },

  // Meals (combo)
  { name: "Biryani (veg)", category: "Meals", servingLabel: "1 plate", caloriesPer: 400, proteinPer: 10, carbsPer: 58, fatPer: 14 },
  { name: "Biryani (chicken)", category: "Meals", servingLabel: "1 plate", caloriesPer: 500, proteinPer: 25, carbsPer: 52, fatPer: 18 },
  { name: "Thali (standard)", category: "Meals", servingLabel: "1 thali", caloriesPer: 650, proteinPer: 18, carbsPer: 80, fatPer: 22 },
  { name: "Maggi noodles", category: "Meals", servingLabel: "1 pack", caloriesPer: 310, proteinPer: 7, carbsPer: 42, fatPer: 13 },
  { name: "Pizza slice", category: "Meals", servingLabel: "1 slice", caloriesPer: 270, proteinPer: 11, carbsPer: 34, fatPer: 10 },
  { name: "Burger", category: "Meals", servingLabel: "1 burger", caloriesPer: 350, proteinPer: 15, carbsPer: 40, fatPer: 14 },
];

const categories = [...new Set(FOOD_DB.map((f) => f.category))];

// ── Row type ─────────────────────────────────────────────────────────────────

interface Row {
  id: number;
  foodIndex: number | null; // index into FOOD_DB
  qty: number;
}

let rowIdCounter = 0;
const newRow = (): Row => ({ id: ++rowIdCounter, foodIndex: null, qty: 1 });

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  targetCalories: number;
  targetProtein: number;
  goal: string;
}

export function MealCalcTable({ targetCalories, targetProtein, goal }: Props) {
  const [rows, setRows] = useState<Row[]>([newRow(), newRow(), newRow()]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        if (row.foodIndex === null) return acc;
        const food = FOOD_DB[row.foodIndex];
        return {
          calories: acc.calories + food.caloriesPer * row.qty,
          protein: acc.protein + food.proteinPer * row.qty,
          carbs: acc.carbs + food.carbsPer * row.qty,
          fat: acc.fat + food.fatPer * row.qty,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [rows]);

  const diff = targetCalories > 0 ? totals.calories - targetCalories : 0;
  const proteinDiff = targetProtein > 0 ? totals.protein - targetProtein : 0;

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return FOOD_DB;
    return FOOD_DB.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q),
    );
  }, [search]);

  const goalLabel = goal === "LOSE" ? "lose weight" : goal === "GAIN" ? "gain weight" : "maintain weight";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Meal planner</p>
          <h2 className="mt-1 text-[26px] font-semibold">Plan what a typical day looks like</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#5f675f]">
            Pick foods you normally eat and see how they stack up against your {goalLabel} target of{" "}
            <span className="font-bold text-[#173c2b]">{targetCalories || "—"} kcal</span>.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-black/10">
        {/* Header */}
        <div className="hidden grid-cols-[2fr_100px_90px_90px_90px_90px_44px] gap-0 bg-[#f1f4f1] px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f675f] md:grid">
          <span className="px-2">Food item</span>
          <span className="px-2 text-center">Qty</span>
          <span className="px-2 text-right">kcal</span>
          <span className="px-2 text-right">Protein</span>
          <span className="px-2 text-right">Carbs</span>
          <span className="px-2 text-right">Fat</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-black/6 bg-white">
          {rows.map((row) => {
            const food = row.foodIndex !== null ? FOOD_DB[row.foodIndex] : null;
            const isOpen = openDropdown === row.id;
            const cal = food ? Math.round(food.caloriesPer * row.qty) : 0;
            const pro = food ? Math.round(food.proteinPer * row.qty * 10) / 10 : 0;
            const carb = food ? Math.round(food.carbsPer * row.qty * 10) / 10 : 0;
            const fat = food ? Math.round(food.fatPer * row.qty * 10) / 10 : 0;

            return (
              <div key={row.id} className="relative">
                {/* Desktop row */}
                <div className="hidden grid-cols-[2fr_100px_90px_90px_90px_90px_44px] items-center gap-0 px-3 py-2 md:grid">
                  {/* Food selector */}
                  <div className="relative px-2">
                    <button
                      type="button"
                      onClick={() => { setOpenDropdown(isOpen ? null : row.id); setSearch(""); }}
                      className="flex w-full items-center justify-between rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2.5 text-left text-[14px] font-bold outline-none transition-colors hover:border-[#0f8b8d]/40"
                    >
                      <span className={food ? "text-[#173c2b]" : "text-[#5f675f]/60"}>
                        {food ? food.name : "Select food..."}
                      </span>
                      <CaretDown size={14} weight="bold" className={`text-[#5f675f] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {food && (
                      <p className="mt-0.5 px-1 text-[11px] text-[#5f675f]">{food.servingLabel}</p>
                    )}

                    {/* Dropdown */}
                    {isOpen && (
                      <div className="absolute left-2 right-2 top-full z-30 mt-1 max-h-[280px] overflow-hidden rounded-lg border border-black/12 bg-white shadow-[0_20px_60px_rgba(16,21,16,0.18)]">
                        <div className="sticky top-0 border-b border-black/8 bg-white p-2">
                          <div className="flex items-center gap-2 rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2">
                            <MagnifyingGlass size={14} weight="bold" className="text-[#5f675f]" />
                            <input
                              autoFocus
                              className="w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#5f675f]/50"
                              placeholder="Search foods..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto">
                          {categories.map((cat) => {
                            const items = filteredFoods.filter((f) => f.category === cat);
                            if (items.length === 0) return null;
                            return (
                              <div key={cat}>
                                <p className="sticky top-0 bg-[#f1f4f1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5f675f]">
                                  {cat}
                                </p>
                                {items.map((food) => {
                                  const idx = FOOD_DB.indexOf(food);
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => { updateRow(row.id, { foodIndex: idx }); setOpenDropdown(null); }}
                                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-[#eef5f2]"
                                    >
                                      <div>
                                        <span className="font-bold text-[#173c2b]">{food.name}</span>
                                        <span className="ml-2 text-[11px] text-[#5f675f]">{food.servingLabel}</span>
                                      </div>
                                      <span className="text-[12px] font-bold text-[#0f8b8d]">{food.caloriesPer} kcal</span>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                          {filteredFoods.length === 0 && (
                            <p className="px-3 py-4 text-center text-[13px] text-[#5f675f]">No foods match "{search}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Qty */}
                  <div className="px-2">
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={row.qty}
                      onChange={(e) => updateRow(row.id, { qty: Math.max(0.5, Number(e.target.value) || 0.5) })}
                      className="w-full rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2.5 text-center text-[14px] font-bold outline-none"
                    />
                  </div>

                  {/* Macros */}
                  <p className={`px-2 text-right text-[15px] font-bold ${food ? "text-[#173c2b]" : "text-[#5f675f]/30"}`}>{food ? cal : "—"}</p>
                  <p className={`px-2 text-right text-[14px] font-semibold ${food ? "text-[#0f8b8d]" : "text-[#5f675f]/30"}`}>{food ? `${pro}g` : "—"}</p>
                  <p className={`px-2 text-right text-[14px] font-semibold ${food ? "text-[#5f675f]" : "text-[#5f675f]/30"}`}>{food ? `${carb}g` : "—"}</p>
                  <p className={`px-2 text-right text-[14px] font-semibold ${food ? "text-[#b7791f]" : "text-[#5f675f]/30"}`}>{food ? `${fat}g` : "—"}</p>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    className="grid h-9 w-9 place-items-center rounded-md border border-black/8 text-[#5f675f] transition-colors hover:border-red-200 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>

                {/* Mobile row */}
                <div className="space-y-3 p-4 md:hidden">
                  <button
                    type="button"
                    onClick={() => { setOpenDropdown(isOpen ? null : row.id); setSearch(""); }}
                    className="flex w-full items-center justify-between rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-3 text-left text-[14px] font-bold"
                  >
                    <span className={food ? "text-[#173c2b]" : "text-[#5f675f]/60"}>
                      {food ? `${food.name} (${food.servingLabel})` : "Select food..."}
                    </span>
                    <CaretDown size={14} weight="bold" className="text-[#5f675f]" />
                  </button>
                  {isOpen && (
                    <div className="max-h-[240px] overflow-y-auto rounded-lg border border-black/12 bg-white shadow-lg">
                      <div className="sticky top-0 border-b border-black/8 bg-white p-2">
                        <div className="flex items-center gap-2 rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2">
                          <MagnifyingGlass size={14} weight="bold" className="text-[#5f675f]" />
                          <input
                            autoFocus
                            className="w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#5f675f]/50"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {categories.map((cat) => {
                        const items = filteredFoods.filter((f) => f.category === cat);
                        if (items.length === 0) return null;
                        return (
                          <div key={cat}>
                            <p className="bg-[#f1f4f1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5f675f]">{cat}</p>
                            {items.map((food) => {
                              const idx = FOOD_DB.indexOf(food);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => { updateRow(row.id, { foodIndex: idx }); setOpenDropdown(null); }}
                                  className="flex w-full items-center justify-between px-3 py-2.5 text-[13px] hover:bg-[#eef5f2]"
                                >
                                  <span className="font-bold text-[#173c2b]">{food.name}</span>
                                  <span className="text-[12px] font-bold text-[#0f8b8d]">{food.caloriesPer} kcal</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {food && (
                    <div className="flex items-center gap-3">
                      <label className="flex-1">
                        <span className="text-[11px] font-bold uppercase text-[#5f675f]">Qty (servings)</span>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={row.qty}
                          onChange={(e) => updateRow(row.id, { qty: Math.max(0.5, Number(e.target.value) || 0.5) })}
                          className="mt-1 w-full rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-center text-[14px] font-bold outline-none"
                        />
                      </label>
                      <div className="flex-1 rounded-md bg-[#eef5f2] p-2 text-center">
                        <p className="text-[18px] font-bold text-[#173c2b]">{cal}</p>
                        <p className="text-[10px] font-bold uppercase text-[#5f675f]">kcal</p>
                      </div>
                      <button type="button" onClick={() => removeRow(row.id)} disabled={rows.length <= 1} className="grid h-10 w-10 place-items-center rounded-md border border-black/8 text-[#5f675f] disabled:opacity-30">
                        <Trash size={14} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add row */}
        <div className="border-t border-black/8 bg-[#f8f8f3] px-3 py-2">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-bold text-[#0f8b8d] transition-colors hover:bg-white"
          >
            <Plus size={14} weight="bold" />
            Add food item
          </button>
        </div>
      </div>

      {/* Totals + comparison */}
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
        {/* Total macros */}
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f675f]">Your day total</p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { label: "Calories", value: Math.round(totals.calories), unit: "kcal", color: "text-[#173c2b]" },
              { label: "Protein", value: `${Math.round(totals.protein)}g`, unit: "", color: "text-[#0f8b8d]" },
              { label: "Carbs", value: `${Math.round(totals.carbs)}g`, unit: "", color: "text-[#5f675f]" },
              { label: "Fat", value: `${Math.round(totals.fat)}g`, unit: "", color: "text-[#b7791f]" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-[#f1f4f1] p-3 text-center">
                <p className={`text-[20px] font-bold ${m.color}`}>{m.value}{m.unit && <span className="text-[12px]"> {m.unit}</span>}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5f675f]">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target comparison */}
        {targetCalories > 0 && totals.calories > 0 && (
          <div className={`rounded-xl border p-5 ${
            diff > 200 ? "border-red-200 bg-red-50" : diff < -200 ? "border-amber-200 bg-amber-50" : "border-[#d7ff68]/60 bg-[#d7ff68]/10"
          }`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f675f]">
              vs your {goalLabel} target
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-[36px] font-bold leading-none ${
                diff > 200 ? "text-red-600" : diff < -200 ? "text-amber-600" : "text-[#173c2b]"
              }`}>
                {diff > 0 ? "+" : ""}{Math.round(diff)}
              </span>
              <span className="text-[14px] font-bold text-[#5f675f]">kcal</span>
            </div>
            <p className="mt-3 text-[13px] font-semibold leading-6 text-[#5f675f]">
              {diff > 200 && goal === "LOSE"
                ? `This day is ${Math.round(diff)} kcal over your fat-loss target. Cut a snack or reduce portion sizes.`
                : diff > 200 && goal === "MAINTAIN"
                ? `This day exceeds your maintenance target by ${Math.round(diff)} kcal. You may gain weight over time.`
                : diff < -200 && goal === "GAIN"
                ? `You're ${Math.round(Math.abs(diff))} kcal below your muscle-gain target. Add a protein-rich meal or snack.`
                : diff < -200
                ? `You're ${Math.round(Math.abs(diff))} kcal under target. That's fine for fat loss, but don't go too low.`
                : "Your planned meals are close to your daily target. This is a sustainable day."}
            </p>
            {targetProtein > 0 && (
              <p className="mt-2 text-[12px] font-semibold text-[#5f675f]">
                Protein: {Math.round(totals.protein)}g / {targetProtein}g
                {proteinDiff < -20 ? " — consider adding eggs, paneer, or dal" : " — on track"}
              </p>
            )}

            {/* Visual bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#5f675f]">
                <span>0</span>
                <span>{targetCalories} kcal target</span>
              </div>
              <div className="relative mt-1 h-3 overflow-hidden rounded-full bg-black/8">
                <div
                  className={`h-full rounded-full transition-all ${
                    diff > 200 ? "bg-red-400" : diff < -200 ? "bg-amber-400" : "bg-[#173c2b]"
                  }`}
                  style={{ width: `${Math.min(100, (totals.calories / targetCalories) * 100)}%` }}
                />
                {totals.calories > targetCalories && (
                  <div
                    className="absolute top-0 h-full rounded-r-full bg-red-400/50"
                    style={{
                      left: "100%",
                      width: `${Math.min(30, ((totals.calories - targetCalories) / targetCalories) * 100)}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
