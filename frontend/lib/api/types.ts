// Shared types for NutriAI API — mirrors Prisma enums + DTO shapes.

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type Sex = "MALE" | "FEMALE" | "OTHER";
export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE";
export type Goal = "LOSE" | "MAINTAIN" | "GAIN";
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type FoodInputType = "TEXT" | "IMAGE";
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

// ── /analyze-food ──
export interface FoodItemDTO {
  name: string;
  quantity?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number | null;
}

export interface AnalyzeFoodResponse {
  queryId: string;
  items: FoodItemDTO[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  confidence: number;
  meta: { provider: string; model: string; cached: boolean; latencyMs: number };
}

// ── /meals ──
export interface MealItemDTO {
  id: string;
  name: string;
  quantity: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealDTO {
  id: string;
  userId: string;
  mealType: MealType;
  loggedAt: string;
  notes: string | null;
  foodQueryId: string | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  items: MealItemDTO[];
}

export interface CreateMealInput {
  mealType: MealType;
  loggedAt?: string;
  notes?: string | null;
  foodQueryId?: string | null;
  items?: Array<{
    name: string;
    quantity?: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

// ── /chat ──
export interface ChatMessageDTO {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageDTO[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// ── /analytics ──
export interface DailyAnalytics {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
}

export interface MacrosSummary {
  from: string;
  to: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
}

// ── /profile ──
export interface UserProfile {
  id: string;
  userId: string;
  sex: Sex | null;
  birthYear: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  targetWeightKg: number | null;
  dailyCalorieTarget: number | null;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
  dietaryPrefs: string[];
  allergies: string[];
  dailyBudgetUsd: number | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateProfileInput = Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>;

// ── /recommendations/meals ──
export interface MealRecommendation {
  name: string;
  description?: string | null;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  reason?: string | null;
}

export interface RecommendationsQuery {
  mealType?: MealType;
  limit?: number;
  remainingCalories?: number;
  remainingProtein?: number;
  remainingCarbs?: number;
  remainingFat?: number;
}

// ── /challenges ──
export type ChallengeCategory = "SUGAR" | "PROTEIN" | "HYDRATION" | "CALORIES" | "STEPS" | "HABIT";
export type ChallengeStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export interface ChallengePreset {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  durationDays: number;
  icon: string;
  createdAt: string;
}

export interface UserChallengeDTO {
  id: string;
  userId: string;
  challengeId: string | null;
  title: string;
  description: string | null;
  durationDays: number;
  startDate: string;
  status: ChallengeStatus;
  daysCheckedIn: number;
  lastCheckInDate: string | null;
  createdAt: string;
  updatedAt: string;
  challenge: ChallengePreset | null;
}

export interface StartChallengeInput {
  challengeId?: string;
  title: string;
  description?: string | null;
  durationDays: number;
}
