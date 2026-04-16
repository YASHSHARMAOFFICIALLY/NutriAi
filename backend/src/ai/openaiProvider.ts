import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { computeCostUsd } from './pricing';
import { FOOD_ANALYSIS_SYSTEM, foodAnalysisUserPrompt } from './prompts/foodAnalysis';
import { CHAT_SYSTEM } from './prompts/chat';
import type { AIProvider, ChatInput, FoodAnalysisInput, FoodAnalysisResult } from './provider';

const FoodItemSchema = z.object({
  name: z.string(),
  quantity: z.string().nullable().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  confidence: z.number().min(0).max(1).optional(),
});

const FoodAnalysisSchema = z.object({
  items: z.array(FoodItemSchema),
  totals: z.object({
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
  }),
  confidence: z.number().min(0).max(1),
});

let client: OpenAI | null = null;
const getClient = (): OpenAI => {
  if (!env.OPENAI_API_KEY) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'OPENAI_API_KEY is not set');
  }
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
};

export const openaiProvider: AIProvider = {
  name: 'openai',

  async analyzeFood(input: FoodAnalysisInput) {
    const openai = getClient();
    const model = input.imageUrl ? env.AI_MODEL_VISION : env.AI_MODEL_TEXT;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: 'text', text: foodAnalysisUserPrompt(input.text) },
    ];
    if (input.imageUrl) {
      userContent.push({ type: 'image_url', image_url: { url: input.imageUrl } });
    }

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: FOOD_ANALYSIS_SYSTEM },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'AI returned no content');

    let parsed: FoodAnalysisResult;
    try {
      parsed = FoodAnalysisSchema.parse(JSON.parse(raw));
    } catch (err) {
      throw new AppError(502, 'AI_BAD_RESPONSE', 'AI response did not match schema', {
        error: (err as Error).message,
      });
    }

    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const totalTokens = completion.usage?.total_tokens ?? promptTokens + completionTokens;

    return {
      data: parsed,
      model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd: computeCostUsd(model, promptTokens, completionTokens),
      },
    };
  },

  async chat(input: ChatInput) {
    const openai = getClient();
    const model = env.AI_MODEL_CHAT;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CHAT_SYSTEM },
      ...input.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      messages,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) throw new AppError(502, 'AI_EMPTY_RESPONSE', 'AI returned no content');

    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const totalTokens = completion.usage?.total_tokens ?? promptTokens + completionTokens;

    return {
      data: { reply },
      model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd: computeCostUsd(model, promptTokens, completionTokens),
      },
    };
  },
};
