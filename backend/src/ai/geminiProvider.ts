// Gemini provider — inactive until AI_PROVIDER=gemini is set in env.
// Install the SDK when ready: npm install @google/generative-ai
//
// To activate:
//   1. npm install @google/generative-ai
//   2. Set GEMINI_API_KEY=<your key> in .env
//   3. Set AI_PROVIDER=gemini in .env
//   4. Uncomment the implementation blocks below and remove the stubs.

import { AppError } from '../utils/errors';
import type { AIProvider, ChatInput, FoodAnalysisInput, FoodAnalysisResult } from './provider';

// ── Stub types (remove once SDK is installed) ────────────────────────────────
// These keep TS happy without the @google/generative-ai package installed.
type GeminiClient = unknown;
const getClient = (): GeminiClient => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'GEMINI_API_KEY is not set');
  }
  // Uncomment once package is installed:
  // const { GoogleGenerativeAI } = await import('@google/generative-ai');
  // return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  throw new AppError(503, 'AI_NOT_CONFIGURED', 'Gemini SDK not installed — run: npm install @google/generative-ai');
};

// ── Model names ──────────────────────────────────────────────────────────────
const MODEL_TEXT   = 'gemini-1.5-flash';   // fast + cheap for text
const MODEL_VISION = 'gemini-1.5-pro';     // vision support

// ── Food analysis system prompt (mirrors OpenAI version) ────────────────────
const FOOD_ANALYSIS_SYSTEM = `You are a nutrition expert. Analyze the food described and return ONLY a JSON object with this exact shape:
{
  "items": [{ "name": string, "quantity": string|null, "calories": number, "protein": number, "carbs": number, "fat": number, "confidence": number }],
  "totals": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "confidence": number
}
All macros in grams. Confidence 0-1. Be accurate.`;

// ── Provider ─────────────────────────────────────────────────────────────────
export const geminiProvider: AIProvider = {
  name: 'gemini',

  async analyzeFood(input: FoodAnalysisInput) {
    void getClient(); // validates key + throws if SDK missing

    // ── Implementation (uncomment after installing SDK) ────────────────────
    // const { GoogleGenerativeAI } = await import('@google/generative-ai');
    // const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // const model = genai.getGenerativeModel({
    //   model: input.imageUrl ? MODEL_VISION : MODEL_TEXT,
    //   systemInstruction: FOOD_ANALYSIS_SYSTEM,
    // });
    //
    // const parts: Part[] = [{ text: input.text ?? 'Analyze the food in the image.' }];
    // if (input.imageUrl) {
    //   const imgResp = await fetch(input.imageUrl);
    //   const imgBuf  = Buffer.from(await imgResp.arrayBuffer());
    //   parts.push({ inlineData: { mimeType: 'image/jpeg', data: imgBuf.toString('base64') } });
    // }
    //
    // const resp = await model.generateContent({ contents: [{ role: 'user', parts }] });
    // const text = resp.response.text();
    // const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as FoodAnalysisResult;
    //
    // const usage = resp.response.usageMetadata ?? {};
    // return {
    //   data: json,
    //   model: input.imageUrl ? MODEL_VISION : MODEL_TEXT,
    //   usage: {
    //     promptTokens:     usage.promptTokenCount     ?? 0,
    //     completionTokens: usage.candidatesTokenCount ?? 0,
    //     totalTokens:      usage.totalTokenCount       ?? 0,
    //     costUsd: 0, // add gemini pricing to pricing.ts when ready
    //   },
    // };

    throw new AppError(503, 'AI_NOT_CONFIGURED', 'Gemini provider is not yet activated');
  },

  async chat(input: ChatInput) {
    void getClient();

    // ── Implementation (uncomment after installing SDK) ────────────────────
    // const { GoogleGenerativeAI } = await import('@google/generative-ai');
    // const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // const model = genai.getGenerativeModel({ model: MODEL_TEXT });
    //
    // const history = input.messages.slice(0, -1).map((m) => ({
    //   role: m.role === 'assistant' ? 'model' : 'user',
    //   parts: [{ text: m.content }],
    // }));
    // const last = input.messages[input.messages.length - 1];
    // const chat = model.startChat({ history });
    // const resp = await chat.sendMessage(last?.content ?? '');
    // const reply = resp.response.text();
    //
    // const usage = resp.response.usageMetadata ?? {};
    // return {
    //   data: { reply },
    //   model: MODEL_TEXT,
    //   usage: {
    //     promptTokens:     usage.promptTokenCount     ?? 0,
    //     completionTokens: usage.candidatesTokenCount ?? 0,
    //     totalTokens:      usage.totalTokenCount       ?? 0,
    //     costUsd: 0,
    //   },
    // };

    throw new AppError(503, 'AI_NOT_CONFIGURED', 'Gemini provider is not yet activated');
  },
};
