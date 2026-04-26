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

export interface SendChatResponse {
  conversationId: string;
  messageId: string;
  reply: string;
  meta: {
    provider: string;
    model: string;
    cached: boolean;
    latencyMs: number;
  };
}

// ── /analytics ──
export interface DailyAnalyticsPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  calorieTargetPct: number | null;
}

export interface DailyAnalytics {
  from: string;
  to: string;
  days: DailyAnalyticsPoint[];
  averages: { calories: number; protein: number; carbs: number; fat: number };
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

export interface MacrosSummary {
  from: string;
  to: string;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  energyShare: { protein: number; carbs: number; fat: number };
  targetAdherence: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

export interface StreakInfo {
  today: string;
  loggingStreak: number;
  calorieTargetStreak: number | null;
  lastLoggedDate: string | null;
}

// ── /family ──
export type FamilyRole = "OWNER" | "VIEWER";
export type FamilyInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface FamilyUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface FamilyMemberDTO {
  id: string;
  familyId: string;
  role: FamilyRole;
  analyticsAccess: boolean;
  joinedAt: string;
  user: FamilyUser;
}

export interface FamilyInviteDTO {
  id: string;
  familyId: string;
  email: string;
  role: FamilyRole;
  analyticsAccess: boolean;
  status: FamilyInviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface FamilyDTO {
  id: string;
  name: string;
  owner: FamilyUser;
  myRole: FamilyRole;
  members: FamilyMemberDTO[];
  invites: FamilyInviteDTO[];
}

export interface FamilyOverview {
  ownedFamily: FamilyDTO | null;
  families: FamilyDTO[];
}

export interface FamilyInviteResponse {
  invite: FamilyInviteDTO;
  token: string;
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
  notifyStreakRisk: boolean;
  notifyWeeklyDigest: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateProfileInput = Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>;

// ── /recommendations/meals ──
export interface MealRecommendation {
  signature: string;
  sampleMealId: string;
  mealType: MealType;
  items: Array<{ name: string; calories: number; protein: number; carbs: number; fat: number }>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  score: number;
  frequency: number;
  lastLoggedAt: string;
  reasons: string[];
}

export interface RemainingBudget {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface MealRecommendationsResponse {
  remaining: RemainingBudget;
  recommendations: MealRecommendation[];
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

// ── /uploads ──
export interface PresignUploadResponse {
  assetId: string;
  uploadUrl: string;
  key: string;
  bucket: string;
  expiresIn: number;
  requiredHeaders: Record<string, string>;
}

export interface ConfirmUploadResponse {
  id: string;
  status: "PENDING" | "UPLOADED";
  size: number | null;
  contentType: string;
  uploadedAt: string | null;
}

// ── /history ──
export interface HistoryEntry {
  id: string;
  createdAt: string;
  inputType: FoodInputType;
  inputText: string | null;
  imageUrl: string | null;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  confidence: number;
  provider: string;
  model: string;
  cached: boolean;
  items: Array<{
    name: string;
    quantity: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── /api-keys ──
export interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  rateLimitPerMin: number;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface IssuedApiKey extends ApiKeyRow {
  token: string;
}

// ── /admin ──
export interface AdminOverview {
  users: { total: number; newThisWeek: number };
  meals: { today: number; thisWeek: number };
  ai: {
    requestsToday: number;
    tokensToday: number;
    costTodayUsd: number;
    costThisWeekUsd: number;
  };
  api: { activeKeys: number; failedCallsToday: number };
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  emailVerified: boolean;
  goal: Goal | null;
  notifications: { streakRisk: boolean; weeklyDigest: boolean };
  counts: {
    meals: number;
    apiKeys: number;
    weightEntries: number;
    challenges: number;
  };
  lastMealAt: string | null;
  ai: { requests: number; totalTokens: number; costUsd: number };
}

export interface AdminUsersResponse {
  items: AdminUserRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserDetail extends AdminUserRow {
  googleId: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  updatedAt: string;
  profile: UserProfile | null;
  sessions: Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    deviceType: string | null;
    deviceModel: string | null;
    os: string | null;
    browser: string | null;
    location: string | null;
    createdAt: string;
    lastSeenAt: string;
    revokedAt: string | null;
    refreshToken: { expiresAt: string; revokedAt: string | null; createdAt: string };
  }>;
  refreshTokens: Array<{ id: string; expiresAt: string; revokedAt: string | null; createdAt: string }>;
  meals: MealDTO[];
  foodQueries: Array<HistoryEntry & { asset: unknown | null }>;
  weightEntries: Array<{ id: string; weightKg: number; note: string | null; recordedAt: string; createdAt: string }>;
  conversations: Array<ConversationDTO>;
  assets: Array<{
    id: string;
    bucket: string;
    key: string;
    contentType: string;
    size: number | null;
    status: string;
    createdAt: string;
    uploadedAt: string | null;
  }>;
  apiKeys: Array<ApiKeyRow & { _count: { usage: number }; usage: Array<{ id: string; endpoint: string; statusCode: number; latencyMs: number; createdAt: string }> }>;
  tokenUsage: Array<{
    id: string;
    endpoint: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    cached: boolean;
    latencyMs: number;
    createdAt: string;
  }>;
  userChallenges: UserChallengeDTO[];
  telegramAccount: unknown | null;
  ownedFamilies: unknown[];
  familyMemberships: unknown[];
  familyInvitesSent: unknown[];
  emailVerificationTokens: unknown[];
  passwordResetTokens: unknown[];
  telegramLinkTokens: unknown[];
  telegramPendingActions: unknown[];
  aiSummary: {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    avgLatencyMs: number;
  };
  _count: {
    meals: number;
    foodQueries: number;
    conversations: number;
    assets: number;
    apiKeys: number;
    tokenUsage: number;
    userChallenges: number;
    weightEntries: number;
    refreshTokens: number;
    sessions: number;
  };
}

export interface AdminUsageResponse {
  summary: {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    avgLatencyMs: number;
    cacheHitRate: number;
  };
  byProvider: Array<{ provider: string; requests: number; totalTokens: number; costUsd: number }>;
  byModel: Array<{ model: string; requests: number; totalTokens: number; costUsd: number }>;
  byEndpoint: Array<{ endpoint: string; requests: number; totalTokens: number; costUsd: number }>;
}

export interface AdminRuntimeResponse {
  runtime: {
    process: { uptimeSec: number; memoryMb: number; nodeEnv: string };
    http: {
      totalRequests: number;
      total5xx: number;
      requestsLastMinute: number;
      errorsLastMinute: number;
      avgLatencyMsLastMinute: number;
    };
    ai: {
      callsLastFiveMinutes: number;
      freshCallsLastFiveMinutes: number;
      cachedCallsLastFiveMinutes: number;
      avgLatencyMsLastFiveMinutes: number;
      costUsdLastFiveMinutes: number;
      tokensLastFiveMinutes: number;
      timeouts: number;
      queueRejects: number;
    };
    resilience: { rateLimitBypass: number };
  };
  aiGuard: {
    active: number;
    waiting: number;
    maxConcurrent: number;
    queueTimeoutMs: number;
    requestTimeoutMs: number;
  };
  today: { slowAiCalls: number; cacheHitRate: number };
  slowAiCalls: Array<{
    id: string;
    endpoint: string;
    provider: string;
    model: string;
    latencyMs: number;
    cached: boolean;
    createdAt: string;
  }>;
}

export interface AdminAiSettings {
  aiDailyBudgetUsd: number;
  aiChatDailyMessageLimit: number;
  aiChatMaxWords: number;
  aiChatHistoryWindow: number;
  aiChatMaxOutputTokens: number;
  aiFoodTextMaxWords: number;
  aiImageDailyLimit: number;
}

export type AdminActivityType = "meal" | "analysis" | "ai_usage" | "api_usage";

export interface AdminActivityItem {
  id: string;
  type: AdminActivityType;
  createdAt: string;
  title: string;
  detail: string;
  user: { id: string; email: string; name: string | null } | null;
}

export interface AdminActivityResponse {
  items: AdminActivityItem[];
}
