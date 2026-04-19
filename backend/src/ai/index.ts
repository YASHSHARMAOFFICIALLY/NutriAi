import { env } from '../config/env';
import { openaiProvider } from './openaiProvider';
import { geminiProvider } from './geminiProvider';
import { stubProvider } from './stubProvider';
import type { AIProvider } from './provider';

let cached: AIProvider | null = null;

export const getAIProvider = (): AIProvider => {
  if (cached) return cached;
  if (env.AI_PROVIDER === 'stub')   cached = stubProvider;
  else if (env.AI_PROVIDER === 'gemini') cached = geminiProvider;
  else cached = openaiProvider;
  return cached;
};

// For tests.
export const resetAIProvider = (): void => {
  cached = null;
};

export * from './provider';
