import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { MealType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { getS3Client, requireBucket } from '../config/s3';
import { BadRequestError } from '../utils/errors';
import { analyzeFood } from './foodService';
import { createMeal, dailySummary } from './mealService';
import { dailyAnalytics, macroAnalytics, streakAnalytics } from './analyticsService';
import { linkTelegramAccount, requireLinkedTelegramAccount } from './telegramAccountService';

type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TelegramMessage = {
  message_id: number;
  chat: { id: number | string; type?: string };
  from?: TelegramUser;
  text?: string;
  photo?: Array<{ file_id: string; file_unique_id: string; width: number; height: number; file_size?: number }>;
};

type TelegramCallbackQuery = {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

const requireBotToken = () => {
  if (!env.TELEGRAM_BOT_TOKEN) throw new BadRequestError('Telegram bot is not configured');
  return env.TELEGRAM_BOT_TOKEN;
};

const telegramApi = async <T>(method: string, body: Record<string, unknown>): Promise<T> => {
  const token = requireBotToken();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!res.ok || !data.ok) {
    throw new BadRequestError(data.description ?? `Telegram ${method} failed`);
  }
  return data.result as T;
};

const sendMessage = (chatId: string | number, text: string, extra: Record<string, unknown> = {}) =>
  telegramApi<TelegramMessage>('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  });

const answerCallback = (callbackQueryId: string, text?: string) =>
  telegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });

const formatNumber = (value: number) => Math.round(value).toLocaleString('en-US');
const macro = (value: number) => `${Math.round(value)}g`;
const MAX_FOOD_TEXT_LENGTH = 2000;
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const mealKeyboard = (pendingActionId: string) => ({
  inline_keyboard: [
    [
      { text: 'Log breakfast', callback_data: `m:B:${pendingActionId}` },
      { text: 'Log lunch', callback_data: `m:L:${pendingActionId}` },
    ],
    [
      { text: 'Log dinner', callback_data: `m:D:${pendingActionId}` },
      { text: 'Log snack', callback_data: `m:S:${pendingActionId}` },
    ],
    [{ text: 'Cancel', callback_data: `m:C:${pendingActionId}` }],
  ],
});

const callbackMealType = (code: string): MealType | null => {
  switch (code) {
    case 'B':
      return 'BREAKFAST';
    case 'L':
      return 'LUNCH';
    case 'D':
      return 'DINNER';
    case 'S':
      return 'SNACK';
    default:
      return null;
  }
};

const helpText =
  'NutriAI Telegram\n\n' +
  'Send a meal photo or describe food in text. I will estimate calories and macros, then you can log it with one tap.\n\n' +
  'Commands:\n' +
  '/today - today calories and macros\n' +
  '/week - 7 day average\n' +
  '/macros - weekly macro split\n' +
  '/streak - logging streak\n' +
  '/log chicken rice - analyze text quickly';

const linkRequiredText =
  'Connect Telegram from NutriAI settings first. Open the website, go to Settings, then choose Connect Telegram.';

const startText = (name: string | null) =>
  `Connected to NutriAI${name ? ` for ${escapeHtml(name)}` : ''}.\n\nSend a food photo or text like "2 eggs and toast" to check calories.`;

const formatAnalysis = (
  title: string,
  result: Awaited<ReturnType<typeof analyzeFood>>,
): string => {
  const itemLines = result.data.items
    .slice(0, 5)
    .map((item) => {
      const quantity = item.quantity ? ` (${escapeHtml(item.quantity)})` : '';
      return `- ${escapeHtml(item.name)}${quantity}`;
    })
    .join('\n');
  return (
    `${title}\n\n` +
    `${itemLines || '- Food estimate'}\n\n` +
    `Calories: <b>${formatNumber(result.data.totals.calories)} kcal</b>\n` +
    `Protein: ${macro(result.data.totals.protein)}\n` +
    `Carbs: ${macro(result.data.totals.carbs)}\n` +
    `Fat: ${macro(result.data.totals.fat)}\n` +
    `Confidence: ${Math.round(result.data.confidence * 100)}%`
  );
};

const createPendingAction = async (args: {
  userId: string;
  telegramUserId: string;
  foodQueryId: string;
  messageId?: string;
}) =>
  prisma.telegramPendingAction.create({
    data: {
      userId: args.userId,
      telegramUserId: args.telegramUserId,
      foodQueryId: args.foodQueryId,
      messageId: args.messageId ?? null,
      expiresAt: new Date(Date.now() + env.TELEGRAM_PENDING_ACTION_TTL_MINUTES * 60_000),
    },
  });

const parseCommand = (text: string) => text.trim().split(/\s+/, 1)[0].split('@', 1)[0].toLowerCase();

export const handleTelegramUpdate = async (update: TelegramUpdate) => {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  if (update.message) {
    await handleMessage(update.message);
  }
};

const handleMessage = async (message: TelegramMessage) => {
  const chatId = message.chat.id;
  const from = message.from;
  if (!from || from.is_bot) return;

  const telegramUserId = String(from.id);
  const text = message.text?.trim();

  if (text?.startsWith('/start')) {
    await handleStart(message, text);
    return;
  }

  if (text?.startsWith('/help')) {
    await sendMessage(chatId, helpText);
    return;
  }

  let account: Awaited<ReturnType<typeof requireLinkedTelegramAccount>>;
  try {
    account = await requireLinkedTelegramAccount(telegramUserId);
  } catch {
    await sendMessage(chatId, linkRequiredText);
    return;
  }

  if (text?.startsWith('/')) {
    await handleCommand(message, account.userId, text);
    return;
  }

  if (message.photo?.length) {
    await analyzePhotoMessage(message, account.userId, telegramUserId);
    return;
  }

  if (text) {
    await analyzeTextMessage(message, account.userId, telegramUserId, text);
    return;
  }

  await sendMessage(chatId, 'Send a food photo or describe your meal in text.');
};

const handleStart = async (message: TelegramMessage, text: string) => {
  const chatId = message.chat.id;
  const from = message.from;
  if (!from) return;

  const [, token] = text.split(/\s+/, 2);
  if (!token) {
    await sendMessage(chatId, linkRequiredText);
    return;
  }

  try {
    const user = await linkTelegramAccount({
      token,
      telegramUserId: String(from.id),
      chatId: String(chatId),
      username: from.username ?? null,
      firstName: from.first_name ?? null,
      lastName: from.last_name ?? null,
    });
    await sendMessage(chatId, startText(user.name ?? user.email));
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Could not link Telegram.';
    await sendMessage(chatId, escapeHtml(messageText));
  }
};

const handleCommand = async (message: TelegramMessage, userId: string, text: string) => {
  const chatId = message.chat.id;
  const command = parseCommand(text);

  if (command === '/today') {
    const summary = await dailySummary(userId, new Date());
    const targetText = summary.totals.calories
      ? `Calories: <b>${formatNumber(summary.totals.calories)} kcal</b>`
      : 'No meals logged today.';
    await sendMessage(
      chatId,
      `Today\n\n${targetText}\nProtein: ${macro(summary.totals.protein)}\nCarbs: ${macro(summary.totals.carbs)}\nFat: ${macro(summary.totals.fat)}\nMeals: ${summary.mealCount}`,
    );
    return;
  }

  if (command === '/week') {
    const analytics = await dailyAnalytics(userId);
    await sendMessage(
      chatId,
      `7 day average\n\nCalories: <b>${formatNumber(analytics.averages.calories)} kcal</b>\nProtein: ${macro(analytics.averages.protein)}\nCarbs: ${macro(analytics.averages.carbs)}\nFat: ${macro(analytics.averages.fat)}\nRange: ${analytics.from} to ${analytics.to}`,
    );
    return;
  }

  if (command === '/macros') {
    const analytics = await macroAnalytics(userId);
    await sendMessage(
      chatId,
      `Weekly macros\n\nCalories: <b>${formatNumber(analytics.totals.calories)} kcal</b>\nProtein: ${macro(analytics.totals.protein)} (${analytics.energyShare.protein}%)\nCarbs: ${macro(analytics.totals.carbs)} (${analytics.energyShare.carbs}%)\nFat: ${macro(analytics.totals.fat)} (${analytics.energyShare.fat}%)`,
    );
    return;
  }

  if (command === '/streak') {
    const streak = await streakAnalytics(userId);
    await sendMessage(
      chatId,
      `Streak\n\nLogging streak: <b>${streak.loggingStreak} days</b>\nCalorie target streak: ${
        streak.calorieTargetStreak == null ? 'No target set' : `${streak.calorieTargetStreak} days`
      }\nLast logged: ${streak.lastLoggedDate ?? 'Never'}`,
    );
    return;
  }

  if (command === '/log') {
    const foodText = text.replace(/^\/log(@\w+)?\s*/i, '').trim();
    if (!foodText) {
      await sendMessage(chatId, 'Use /log followed by food, for example: /log chicken rice bowl');
      return;
    }
    const telegramUserId = String(message.from?.id);
    await analyzeTextMessage(message, userId, telegramUserId, foodText);
    return;
  }

  await sendMessage(chatId, helpText);
};

const analyzeTextMessage = async (
  message: TelegramMessage,
  userId: string,
  telegramUserId: string,
  text: string,
) => {
  if (text.length > MAX_FOOD_TEXT_LENGTH) {
    await sendMessage(message.chat.id, 'That food description is too long. Keep it under 2000 characters.');
    return;
  }

  const result = await analyzeFood({ userId, input: { text } });
  const pending = await createPendingAction({
    userId,
    telegramUserId,
    foodQueryId: result.queryId,
    messageId: String(message.message_id),
  });
  await sendMessage(message.chat.id, formatAnalysis('Food estimate', result), {
    reply_markup: mealKeyboard(pending.id),
  });
};

const analyzePhotoMessage = async (message: TelegramMessage, userId: string, telegramUserId: string) => {
  const photo = [...(message.photo ?? [])].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0))[0];
  if (!photo) {
    await sendMessage(message.chat.id, 'I could not read that photo. Try another image.');
    return;
  }

  const assetId = await uploadTelegramPhoto(userId, photo.file_id);
  const result = await analyzeFood({ userId, input: { assetId } });
  const pending = await createPendingAction({
    userId,
    telegramUserId,
    foodQueryId: result.queryId,
    messageId: String(message.message_id),
  });

  await sendMessage(message.chat.id, formatAnalysis('Photo estimate', result), {
    reply_markup: mealKeyboard(pending.id),
  });
};

const uploadTelegramPhoto = async (userId: string, fileId: string): Promise<string> => {
  const token = requireBotToken();
  const file = await telegramApi<{ file_path: string; file_size?: number }>('getFile', { file_id: fileId });
  const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
  if (!fileRes.ok) throw new BadRequestError('Could not download Telegram photo');

  const bytes = Buffer.from(await fileRes.arrayBuffer());
  if (bytes.length > env.UPLOAD_MAX_SIZE_BYTES) {
    throw new BadRequestError('Telegram photo exceeds maximum upload size');
  }

  const bucket = requireBucket();
  const key = `uploads/${userId}/telegram-${Date.now()}-${randomUUID()}.jpg`;
  const contentType = fileRes.headers.get('content-type') ?? 'image/jpeg';

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }),
  );

  const asset = await prisma.asset.create({
    data: {
      userId,
      bucket,
      key,
      contentType,
      size: bytes.length,
      status: 'UPLOADED',
      uploadedAt: new Date(),
    },
  });

  return asset.id;
};

const handleCallback = async (callback: TelegramCallbackQuery) => {
  const data = callback.data ?? '';
  const [, action, pendingActionId] = data.split(':');
  if (!data.startsWith('m:') || !pendingActionId) {
    await answerCallback(callback.id);
    return;
  }

  const chatId = callback.message?.chat.id;
  const telegramUserId = String(callback.from.id);

  if (action === 'C') {
    await prisma.telegramPendingAction.deleteMany({
      where: { id: pendingActionId, telegramUserId },
    });
    await answerCallback(callback.id, 'Cancelled');
    if (chatId) await sendMessage(chatId, 'Cancelled.');
    return;
  }

  const mealType = callbackMealType(action);
  if (!mealType) {
    await answerCallback(callback.id, 'Unknown action');
    return;
  }

  const pending = await prisma.telegramPendingAction.findFirst({
    where: {
      id: pendingActionId,
      telegramUserId,
      expiresAt: { gt: new Date() },
    },
  });

  if (!pending) {
    await answerCallback(callback.id, 'This food estimate expired.');
    if (chatId) await sendMessage(chatId, 'This food estimate expired. Send the food again to log it.');
    return;
  }

  const deleted = await prisma.telegramPendingAction.deleteMany({
    where: {
      id: pending.id,
      telegramUserId,
      expiresAt: { gt: new Date() },
    },
  });
  if (deleted.count !== 1) {
    await answerCallback(callback.id, 'Already handled');
    if (chatId) await sendMessage(chatId, 'This food estimate was already handled.');
    return;
  }

  await createMeal({
    userId: pending.userId,
    mealType,
    loggedAt: new Date(),
    foodQueryId: pending.foodQueryId,
    items: [],
    notes: 'Logged from Telegram',
  });

  const summary = await dailySummary(pending.userId, new Date());
  await answerCallback(callback.id, 'Logged');
  if (chatId) {
    await sendMessage(
      chatId,
      `Logged as ${mealType.toLowerCase()}.\n\nToday: <b>${formatNumber(summary.totals.calories)} kcal</b>\nProtein: ${macro(summary.totals.protein)}\nMeals: ${summary.mealCount}`,
    );
  }
};
