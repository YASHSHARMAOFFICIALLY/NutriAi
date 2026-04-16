// Provider-agnostic types for every AI call. Keeping these here means feature
// services depend on the interface, not a specific SDK.

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface AICallMeta {
  provider: string;
  model: string;
  cached: boolean;
  latencyMs: number;
  usage: AIUsage;
}

export interface AICallResult<T> extends AICallMeta {
  data: T;
}

export interface FoodItemResult {
  name: string;
  quantity?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number;
}

export interface FoodAnalysisResult {
  items: FoodItemResult[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence: number;
}

export interface FoodAnalysisInput {
  text?: string;
  imageUrl?: string;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatInput {
  messages: ChatMessage[];
}

export interface ChatResult {
  reply: string;
}

export interface AIProvider {
  name: string;
  analyzeFood(input: FoodAnalysisInput): Promise<{
    data: FoodAnalysisResult;
    usage: AIUsage;
    model: string;
  }>;
  chat(input: ChatInput): Promise<{
    data: ChatResult;
    usage: AIUsage;
    model: string;
  }>;
}
