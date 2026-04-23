import { BadRequestError, RateLimitError } from '../utils/errors';

export interface ChatPolicyConfig {
  dailyMessageLimit: number;
  maxWordsPerMessage: number;
}

export const countWords = (message: string): number => {
  const trimmed = message.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export const startOfUtcDay = (now: Date = new Date()): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export const assertChatMessageAllowed = (
  message: string,
  messagesUsedToday: number,
  config: ChatPolicyConfig,
): void => {
  const words = countWords(message);
  if (words > config.maxWordsPerMessage) {
    throw new BadRequestError(
      `Chat messages are limited to ${config.maxWordsPerMessage} words`,
      { maxWordsPerMessage: config.maxWordsPerMessage, words },
    );
  }

  if (messagesUsedToday >= config.dailyMessageLimit) {
    throw new RateLimitError(
      `Daily chat limit reached. You can send ${config.dailyMessageLimit} messages per day.`,
    );
  }
};
