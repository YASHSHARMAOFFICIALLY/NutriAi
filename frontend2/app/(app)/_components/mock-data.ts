export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type FoodItem = {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
};

export type Meal = {
  id: string;
  mealType: MealType;
  title: string;
  loggedAt: string;
  source: "TEXT" | "IMAGE";
  provider: "cache" | "db" | "usda" | "openai" | "gemini";
  cached: boolean;
  confidence: number;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  items: FoodItem[];
};

export const profile = {
  name: "Yash",
  goal: "GAIN",
  activityLevel: "MODERATE",
  sex: "MALE",
  birthYear: 1998,
  heightCm: 178,
  weightKg: 72.4,
  targetWeightKg: 76,
  dailyBudgetUsd: 12,
  timezone: "Asia/Kolkata",
  dietaryPrefs: ["high protein", "Indian food", "quick dinners"],
  allergies: ["peanuts"],
  derived: { bmr: 1690, tdee: 2620 },
  targets: { calories: 2150, protein: 150, carbs: 220, fat: 68 },
};

export const todayMeals: Meal[] = [
  {
    id: "meal_01",
    mealType: "BREAKFAST",
    title: "Oats, banana, honey",
    loggedAt: "08:15",
    source: "TEXT",
    provider: "usda",
    cached: false,
    confidence: 0.88,
    totals: { calories: 410, protein: 18, carbs: 62, fat: 9 },
    items: [
      { name: "Oats", quantity: "60g", calories: 228, protein: 8, carbs: 39, fat: 4, confidence: 0.94 },
      { name: "Banana", quantity: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0, confidence: 0.9 },
      { name: "Honey", quantity: "1 tbsp", calories: 77, protein: 0, carbs: 21, fat: 0, confidence: 0.78 },
    ],
  },
  {
    id: "meal_02",
    mealType: "LUNCH",
    title: "Paneer rice bowl",
    loggedAt: "13:05",
    source: "IMAGE",
    provider: "openai",
    cached: false,
    confidence: 0.92,
    totals: { calories: 640, protein: 38, carbs: 74, fat: 21 },
    items: [
      { name: "Paneer", quantity: "120g", calories: 320, protein: 22, carbs: 6, fat: 24, confidence: 0.9 },
      { name: "Rice", quantity: "1 cup", calories: 210, protein: 4, carbs: 45, fat: 1, confidence: 0.93 },
      { name: "Mixed vegetables", quantity: "90g", calories: 70, protein: 4, carbs: 12, fat: 1, confidence: 0.86 },
      { name: "Cooking oil", quantity: "1 tsp", calories: 40, protein: 0, carbs: 0, fat: 4, confidence: 0.72 },
    ],
  },
  {
    id: "meal_03",
    mealType: "SNACK",
    title: "Greek yogurt with berries",
    loggedAt: "16:40",
    source: "TEXT",
    provider: "cache",
    cached: true,
    confidence: 0.96,
    totals: { calories: 260, protein: 24, carbs: 32, fat: 4 },
    items: [
      { name: "Greek yogurt", quantity: "200g", calories: 170, protein: 22, carbs: 10, fat: 4, confidence: 0.98 },
      { name: "Mixed berries", quantity: "100g", calories: 58, protein: 1, carbs: 14, fat: 0, confidence: 0.9 },
      { name: "Granola", quantity: "15g", calories: 32, protein: 1, carbs: 8, fat: 0, confidence: 0.85 },
    ],
  },
];

const sum = (key: keyof Meal["totals"]) => todayMeals.reduce((total, meal) => total + meal.totals[key], 0);

export const summary = {
  date: "2026-04-22",
  totals: {
    calories: sum("calories"),
    protein: sum("protein"),
    carbs: sum("carbs"),
    fat: sum("fat"),
  },
  mealCount: todayMeals.length,
};

export const remaining = {
  calories: Math.max(0, profile.targets.calories - summary.totals.calories),
  protein: Math.max(0, profile.targets.protein - summary.totals.protein),
  carbs: Math.max(0, profile.targets.carbs - summary.totals.carbs),
  fat: Math.max(0, profile.targets.fat - summary.totals.fat),
};

export const analysisCandidate = {
  queryId: "fq_9x2",
  inputType: "IMAGE",
  sourceSteps: [
    { label: "Private upload resolved", state: "done" },
    { label: "Cache checked", state: "done" },
    { label: "AI vision estimate", state: "done" },
  ],
  provider: "openai",
  model: "vision",
  cached: false,
  latencyMs: 1840,
  confidence: 0.92,
  title: "Paneer rice bowl",
  mealType: "LUNCH" as MealType,
  items: todayMeals[1].items,
  totals: todayMeals[1].totals,
};

export const recommendations = [
  {
    signature: "DINNER:dal|roti|salad",
    mealType: "DINNER" as MealType,
    title: "Dal, cucumber salad, small roti",
    score: 0.86,
    frequency: 5,
    lastLoggedAt: "2026-04-16",
    reasons: ["fits remaining calorie budget", "helps close protein gap", "you eat this often"],
    totals: { calories: 390, protein: 26, carbs: 54, fat: 8 },
    items: ["Dal", "Cucumber salad", "Small roti"],
  },
  {
    signature: "DINNER:tofu|rice|vegetables",
    mealType: "DINNER" as MealType,
    title: "Tofu tikka bowl",
    score: 0.82,
    frequency: 3,
    lastLoggedAt: "2026-04-11",
    reasons: ["helps close protein gap", "been a while since you had this"],
    totals: { calories: 420, protein: 36, carbs: 42, fat: 11 },
    items: ["Tofu tikka", "Small rice", "Vegetables"],
  },
  {
    signature: "SNACK:yogurt|fruit",
    mealType: "SNACK" as MealType,
    title: "Greek yogurt fruit bowl",
    score: 0.74,
    frequency: 7,
    lastLoggedAt: "2026-04-22",
    reasons: ["helps close protein gap", "you eat this often"],
    totals: { calories: 280, protein: 24, carbs: 34, fat: 5 },
    items: ["Greek yogurt", "Berries", "Granola"],
  },
];

export const analytics = {
  averages: { calories: 1706, protein: 94, carbs: 182, fat: 54 },
  targets: profile.targets,
  streak: { loggingStreak: 12, calorieTargetStreak: 4, lastLoggedDate: "2026-04-22" },
  days: [
    { date: "Thu", calories: 1780, protein: 92, mealCount: 3, calorieTargetPct: 82.8 },
    { date: "Fri", calories: 2120, protein: 118, mealCount: 4, calorieTargetPct: 98.6 },
    { date: "Sat", calories: 2410, protein: 86, mealCount: 3, calorieTargetPct: 112.1 },
    { date: "Sun", calories: 1640, protein: 76, mealCount: 2, calorieTargetPct: 76.3 },
    { date: "Mon", calories: 1900, protein: 104, mealCount: 3, calorieTargetPct: 88.4 },
    { date: "Tue", calories: 1810, protein: 112, mealCount: 3, calorieTargetPct: 84.2 },
    { date: "Wed", calories: 1310, protein: 80, mealCount: 3, calorieTargetPct: 60.9 },
  ],
  macroShare: { protein: 24, carbs: 47, fat: 29 },
};

export const challenge = {
  id: "uc_01",
  title: "Protein floor",
  description: "Hit at least 130g protein every day.",
  durationDays: 7,
  daysCheckedIn: 5,
  lastCheckInDate: "2026-04-21",
  status: "ACTIVE",
  category: "PROTEIN",
};

export const weightEntries = [
  { date: "Apr 22", weightKg: 72.4, note: "Morning weigh-in" },
  { date: "Apr 19", weightKg: 72.7, note: "After travel day" },
  { date: "Apr 14", weightKg: 73.1, note: "Normal routine" },
  { date: "Apr 07", weightKg: 74.2, note: "Starting point" },
];
