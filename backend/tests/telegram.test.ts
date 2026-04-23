import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const tx = {
    telegramLinkToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    telegramAccount: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    telegramPendingAction: {
      deleteMany: vi.fn(),
    },
    user: {
      findUniqueOrThrow: vi.fn(),
    },
  };

  return {
    env: {
      TELEGRAM_BOT_TOKEN: 'test-bot-token',
      TELEGRAM_BOT_USERNAME: 'nutriai_test_bot',
      TELEGRAM_WEBHOOK_SECRET: 'webhook-secret',
      TELEGRAM_LINK_TOKEN_TTL_MINUTES: 10,
      TELEGRAM_PENDING_ACTION_TTL_MINUTES: 15,
      UPLOAD_MAX_SIZE_BYTES: 10 * 1024 * 1024,
    },
    tx,
    prisma: {
      $transaction: vi.fn((cb: (arg: typeof tx) => unknown) => cb(tx)),
      telegramPendingAction: {
        create: vi.fn(),
        deleteMany: vi.fn(),
        findFirst: vi.fn(),
      },
      asset: {
        create: vi.fn(),
      },
    },
    analyzeFood: vi.fn(),
    createMeal: vi.fn(),
    dailySummary: vi.fn(),
    dailyAnalytics: vi.fn(),
    macroAnalytics: vi.fn(),
    streakAnalytics: vi.fn(),
    linkTelegramAccount: vi.fn(),
    requireLinkedTelegramAccount: vi.fn(),
    s3Send: vi.fn(),
  };
});

vi.mock('../src/config/env', () => ({
  env: mocks.env,
  isProd: false,
  isTest: true,
}));

vi.mock('../src/config/prisma', () => ({ prisma: mocks.prisma }));

vi.mock('../src/config/s3', () => ({
  requireBucket: vi.fn(() => 'bucket'),
  getS3Client: vi.fn(() => ({ send: mocks.s3Send })),
}));

vi.mock('../src/services/foodService', () => ({ analyzeFood: mocks.analyzeFood }));
vi.mock('../src/services/mealService', () => ({
  createMeal: mocks.createMeal,
  dailySummary: mocks.dailySummary,
}));
vi.mock('../src/services/analyticsService', () => ({
  dailyAnalytics: mocks.dailyAnalytics,
  macroAnalytics: mocks.macroAnalytics,
  streakAnalytics: mocks.streakAnalytics,
}));
vi.mock('../src/services/telegramAccountService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/services/telegramAccountService')>()),
  linkTelegramAccount: mocks.linkTelegramAccount,
  requireLinkedTelegramAccount: mocks.requireLinkedTelegramAccount,
}));

const telegramFetchResult = { ok: true, result: { message_id: 99, chat: { id: 123 } } };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.$transaction.mockImplementation((cb: (arg: typeof mocks.tx) => unknown) => cb(mocks.tx));
  mocks.tx.telegramAccount.delete.mockResolvedValue({});
  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => telegramFetchResult,
  })) as unknown as typeof fetch;
});

describe('Telegram account service', () => {
  it('creates one active link token per user and returns a bot deep link', async () => {
    const { createTelegramLink } = await import('../src/services/telegramAccountService');

    const result = await createTelegramLink('user-1');

    expect(mocks.tx.telegramLinkToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(mocks.tx.telegramLinkToken.create).toHaveBeenCalledOnce();
    const createArg = mocks.tx.telegramLinkToken.create.mock.calls[0][0];
    expect(createArg.data.userId).toBe('user-1');
    expect(createArg.data.tokenHash).toHaveLength(64);
    expect(createArg.data.tokenHash).not.toBe(result.token);
    expect(result.deepLink).toBe(`https://t.me/nutriai_test_bot?start=${result.token}`);
  });

  it('cleans pending actions and link tokens when unlinking Telegram', async () => {
    const { unlinkTelegramAccount } = await import('../src/services/telegramAccountService');

    await unlinkTelegramAccount('user-1');

    expect(mocks.tx.telegramPendingAction.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(mocks.tx.telegramLinkToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(mocks.tx.telegramAccount.delete).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});

describe('Telegram message handling', () => {
  it('escapes analyzed item names before sending an HTML Telegram message', async () => {
    const { handleTelegramUpdate } = await import('../src/services/telegramService');
    mocks.requireLinkedTelegramAccount.mockResolvedValue({ userId: 'user-1' });
    mocks.analyzeFood.mockResolvedValue({
      queryId: 'food-query-1',
      data: {
        items: [{ name: 'Fish <bowl> & rice', quantity: '1 <plate>', calories: 500, protein: 30, carbs: 55, fat: 12 }],
        totals: { calories: 500, protein: 30, carbs: 55, fat: 12 },
        confidence: 0.91,
      },
    });
    mocks.prisma.telegramPendingAction.create.mockResolvedValue({ id: 'pending-1' });

    await handleTelegramUpdate({
      update_id: 1,
      message: {
        message_id: 10,
        chat: { id: 123 },
        from: { id: 456 },
        text: 'fish bowl',
      },
    });

    const telegramBody = JSON.parse((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(telegramBody.text).toContain('Fish &lt;bowl&gt; &amp; rice');
    expect(telegramBody.text).toContain('(1 &lt;plate&gt;)');
    expect(telegramBody.text).not.toContain('Fish <bowl> & rice');
  });

  it('rejects overlong food text before calling the analyzer', async () => {
    const { handleTelegramUpdate } = await import('../src/services/telegramService');
    mocks.requireLinkedTelegramAccount.mockResolvedValue({ userId: 'user-1' });

    await handleTelegramUpdate({
      update_id: 1,
      message: {
        message_id: 10,
        chat: { id: 123 },
        from: { id: 456 },
        text: 'x'.repeat(2001),
      },
    });

    expect(mocks.analyzeFood).not.toHaveBeenCalled();
    const telegramBody = JSON.parse((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(telegramBody.text).toContain('too long');
  });

  it('deletes a pending action before logging so double taps are idempotent', async () => {
    const { handleTelegramUpdate } = await import('../src/services/telegramService');
    mocks.prisma.telegramPendingAction.findFirst.mockResolvedValue({
      id: 'pending-1',
      userId: 'user-1',
      telegramUserId: '456',
      foodQueryId: 'food-query-1',
    });
    mocks.prisma.telegramPendingAction.deleteMany.mockResolvedValue({ count: 1 });
    mocks.dailySummary.mockResolvedValue({
      totals: { calories: 650, protein: 40, carbs: 70, fat: 18 },
      mealCount: 2,
    });

    await handleTelegramUpdate({
      update_id: 1,
      callback_query: {
        id: 'callback-1',
        from: { id: 456 },
        message: { message_id: 10, chat: { id: 123 } },
        data: 'm:L:pending-1',
      },
    });

    expect(mocks.prisma.telegramPendingAction.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'pending-1',
        telegramUserId: '456',
        expiresAt: { gt: expect.any(Date) },
      },
    });
    expect(mocks.createMeal).toHaveBeenCalledWith({
      userId: 'user-1',
      mealType: 'LUNCH',
      loggedAt: expect.any(Date),
      foodQueryId: 'food-query-1',
      items: [],
      notes: 'Logged from Telegram',
    });
  });

  it('does not log a meal when pending action deletion loses the race', async () => {
    const { handleTelegramUpdate } = await import('../src/services/telegramService');
    mocks.prisma.telegramPendingAction.findFirst.mockResolvedValue({
      id: 'pending-1',
      userId: 'user-1',
      telegramUserId: '456',
      foodQueryId: 'food-query-1',
    });
    mocks.prisma.telegramPendingAction.deleteMany.mockResolvedValue({ count: 0 });

    await handleTelegramUpdate({
      update_id: 1,
      callback_query: {
        id: 'callback-1',
        from: { id: 456 },
        message: { message_id: 10, chat: { id: 123 } },
        data: 'm:L:pending-1',
      },
    });

    expect(mocks.createMeal).not.toHaveBeenCalled();
  });
});
