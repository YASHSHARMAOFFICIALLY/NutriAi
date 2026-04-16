import { env } from '../config/env';
import { openaiProvider } from './openaiProvider';
import { stubProvider } from './stubProvider';
import type { AIProvider } from './provider';

let cached: AIProvider | null = null;

export const getAIProvider = (): AIProvider => {
  if (cached) return cached;
  cached = env.AI_PROVIDER === 'stub' ? stubProvider : openaiProvider;
  return cached;
};

// For tests.
export const resetAIProvider = (): void => {
  cached = null;
};

export * from './provider';
