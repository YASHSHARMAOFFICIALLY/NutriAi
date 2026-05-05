import { BadRequestError, RateLimitError } from '../utils/errors';
import { countWords } from '../utils/text';

export { startOfUtcDay } from '../utils/date';
export { countWords };

export interface ChatPolicyConfig {
  dailyMessageLimit: number;
  maxWordsPerMessage: number;
}

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
