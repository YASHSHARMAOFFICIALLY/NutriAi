import { prisma } from '../config/prisma';
import { env } from '../config/env';

const SETTINGS_ID = 'default';

export interface AiSettings {
  aiDailyBudgetUsd: number;
  aiChatDailyMessageLimit: number;
  aiChatMaxWords: number;
  aiChatHistoryWindow: number;
  aiChatMaxOutputTokens: number;
  aiFoodTextMaxWords: number;
  aiImageDailyLimit: number;
}

export interface UpdateAiSettingsInput {
  aiDailyBudgetUsd: number;
  aiChatDailyMessageLimit: number;
  aiChatMaxWords: number;
  aiChatHistoryWindow: number;
  aiChatMaxOutputTokens: number;
  aiFoodTextMaxWords: number;
  aiImageDailyLimit: number;
}

const defaults = (): AiSettings => ({
  aiDailyBudgetUsd: env.AI_DAILY_BUDGET_USD,
  aiChatDailyMessageLimit: env.AI_CHAT_DAILY_MESSAGE_LIMIT,
  aiChatMaxWords: env.AI_CHAT_MAX_WORDS,
  aiChatHistoryWindow: env.AI_CHAT_HISTORY_WINDOW,
  aiChatMaxOutputTokens: env.AI_CHAT_MAX_OUTPUT_TOKENS,
  aiFoodTextMaxWords: env.AI_FOOD_TEXT_MAX_WORDS,
  aiImageDailyLimit: env.AI_IMAGE_DAILY_LIMIT,
});

export const getAiSettings = async (): Promise<AiSettings> => {
  const row = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  const fallback = defaults();
  if (!row) return fallback;

  return {
    aiDailyBudgetUsd: row.aiDailyBudgetUsd ?? fallback.aiDailyBudgetUsd,
    aiChatDailyMessageLimit:
      row.aiChatDailyMessageLimit ?? fallback.aiChatDailyMessageLimit,
    aiChatMaxWords: row.aiChatMaxWords ?? fallback.aiChatMaxWords,
    aiChatHistoryWindow: row.aiChatHistoryWindow ?? fallback.aiChatHistoryWindow,
    aiChatMaxOutputTokens:
      row.aiChatMaxOutputTokens ?? fallback.aiChatMaxOutputTokens,
    aiFoodTextMaxWords: row.aiFoodTextMaxWords ?? fallback.aiFoodTextMaxWords,
    aiImageDailyLimit: row.aiImageDailyLimit ?? fallback.aiImageDailyLimit,
  };
};

export const updateAiSettings = async (
  input: UpdateAiSettingsInput,
): Promise<AiSettings> => {
  const row = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      aiDailyBudgetUsd: input.aiDailyBudgetUsd,
      aiChatDailyMessageLimit: input.aiChatDailyMessageLimit,
      aiChatMaxWords: input.aiChatMaxWords,
      aiChatHistoryWindow: input.aiChatHistoryWindow,
      aiChatMaxOutputTokens: input.aiChatMaxOutputTokens,
      aiFoodTextMaxWords: input.aiFoodTextMaxWords,
      aiImageDailyLimit: input.aiImageDailyLimit,
    },
    update: {
      aiDailyBudgetUsd: input.aiDailyBudgetUsd,
      aiChatDailyMessageLimit: input.aiChatDailyMessageLimit,
      aiChatMaxWords: input.aiChatMaxWords,
      aiChatHistoryWindow: input.aiChatHistoryWindow,
      aiChatMaxOutputTokens: input.aiChatMaxOutputTokens,
      aiFoodTextMaxWords: input.aiFoodTextMaxWords,
      aiImageDailyLimit: input.aiImageDailyLimit,
    },
  });

  return {
    aiDailyBudgetUsd: row.aiDailyBudgetUsd ?? input.aiDailyBudgetUsd,
    aiChatDailyMessageLimit:
      row.aiChatDailyMessageLimit ?? input.aiChatDailyMessageLimit,
    aiChatMaxWords: row.aiChatMaxWords ?? input.aiChatMaxWords,
    aiChatHistoryWindow:
      row.aiChatHistoryWindow ?? input.aiChatHistoryWindow,
    aiChatMaxOutputTokens:
      row.aiChatMaxOutputTokens ?? input.aiChatMaxOutputTokens,
    aiFoodTextMaxWords:
      row.aiFoodTextMaxWords ?? input.aiFoodTextMaxWords,
    aiImageDailyLimit: row.aiImageDailyLimit ?? input.aiImageDailyLimit,
  };
};
