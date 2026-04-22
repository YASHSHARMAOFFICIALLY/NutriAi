import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { getAiGuardState } from '../ai/guard';
import { getRuntimeMetrics } from './runtimeMetrics';

const startOfToday = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const roundMoney = (n: number): number => Math.round(n * 10_000) / 10_000;

export interface AdminListUsersInput {
  search?: string;
  role?: Role;
  page: number;
  limit: number;
}

export interface AdminUsageInput {
  from?: Date;
  to?: Date;
}

const dateWhere = (input: AdminUsageInput): Prisma.DateTimeFilter | undefined => {
  if (!input.from && !input.to) return undefined;
  return {
    ...(input.from ? { gte: input.from } : {}),
    ...(input.to ? { lte: input.to } : {}),
  };
};

export async function getAdminOverview() {
  const today = startOfToday();
  const week = daysAgo(7);

  const [
    totalUsers,
    newUsersThisWeek,
    mealsToday,
    mealsThisWeek,
    aiToday,
    aiWeek,
    activeApiKeys,
    failedApiCallsToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: week } } }),
    prisma.meal.count({ where: { loggedAt: { gte: today } } }),
    prisma.meal.count({ where: { loggedAt: { gte: week } } }),
    prisma.tokenUsage.aggregate({
      where: { createdAt: { gte: today } },
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
    }),
    prisma.tokenUsage.aggregate({
      where: { createdAt: { gte: week } },
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
    }),
    prisma.apiKey.count({ where: { revokedAt: null } }),
    prisma.apiUsage.count({ where: { statusCode: { gte: 400 }, createdAt: { gte: today } } }),
  ]);

  return {
    users: { total: totalUsers, newThisWeek: newUsersThisWeek },
    meals: { today: mealsToday, thisWeek: mealsThisWeek },
    ai: {
      requestsToday: aiToday._count._all,
      tokensToday: aiToday._sum.totalTokens ?? 0,
      costTodayUsd: roundMoney(aiToday._sum.costUsd ?? 0),
      costThisWeekUsd: roundMoney(aiWeek._sum.costUsd ?? 0),
    },
    api: { activeKeys: activeApiKeys, failedCallsToday: failedApiCallsToday },
  };
}

export async function getAdminRuntime() {
  const today = startOfToday();

  const [recentFailures, slowAiCalls, cacheHits, totalAiCalls] = await Promise.all([
    prisma.tokenUsage.count({
      where: { createdAt: { gte: today }, latencyMs: { gte: 15_000 } },
    }),
    prisma.tokenUsage.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { latencyMs: 'desc' },
      take: 5,
      select: {
        id: true,
        endpoint: true,
        provider: true,
        model: true,
        latencyMs: true,
        cached: true,
        createdAt: true,
      },
    }),
    prisma.tokenUsage.count({ where: { createdAt: { gte: today }, cached: true } }),
    prisma.tokenUsage.count({ where: { createdAt: { gte: today } } }),
  ]);

  return {
    runtime: getRuntimeMetrics(),
    aiGuard: getAiGuardState(),
    today: {
      slowAiCalls: recentFailures,
      cacheHitRate: totalAiCalls > 0 ? Math.round((cacheHits / totalAiCalls) * 1000) / 10 : 0,
    },
    slowAiCalls: slowAiCalls.map((row) => ({
      id: row.id,
      endpoint: row.endpoint,
      provider: row.provider,
      model: row.model,
      latencyMs: row.latencyMs,
      cached: row.cached,
      createdAt: row.createdAt,
    })),
  };
}

export async function listAdminUsers(input: AdminListUsersInput) {
  const where: Prisma.UserWhereInput = {
    ...(input.role ? { role: input.role } : {}),
    ...(input.search
      ? {
          OR: [
            { email: { contains: input.search, mode: 'insensitive' } },
            { name: { contains: input.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const skip = (input.page - 1) * input.limit;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: input.limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        profile: { select: { goal: true, notifyStreakRisk: true, notifyWeeklyDigest: true } },
        meals: {
          orderBy: { loggedAt: 'desc' },
          take: 1,
          select: { loggedAt: true },
        },
        _count: {
          select: {
            meals: true,
            apiKeys: true,
            weightEntries: true,
            userChallenges: true,
          },
        },
      },
    }),
  ]);

  const usage = await Promise.all(
    users.map((user) =>
      prisma.tokenUsage.aggregate({
        where: { userId: user.id },
        _sum: { costUsd: true, totalTokens: true },
        _count: { _all: true },
      }),
    ),
  );

  return {
    items: users.map((user, i) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      goal: user.profile?.goal ?? null,
      notifications: {
        streakRisk: user.profile?.notifyStreakRisk ?? false,
        weeklyDigest: user.profile?.notifyWeeklyDigest ?? false,
      },
      counts: {
        meals: user._count.meals,
        apiKeys: user._count.apiKeys,
        weightEntries: user._count.weightEntries,
        challenges: user._count.userChallenges,
      },
      lastMealAt: user.meals[0]?.loggedAt ?? null,
      ai: {
        requests: usage[i]._count._all,
        totalTokens: usage[i]._sum.totalTokens ?? 0,
        costUsd: roundMoney(usage[i]._sum.costUsd ?? 0),
      },
    })),
    page: input.page,
    limit: input.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / input.limit)),
  };
}

export async function getAdminUsage(input: AdminUsageInput) {
  const createdAt = dateWhere(input);
  const where = createdAt ? { createdAt } : {};

  const [summary, byProvider, byModel, byEndpoint] = await Promise.all([
    prisma.tokenUsage.aggregate({
      where,
      _count: { _all: true },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        costUsd: true,
      },
      _avg: { latencyMs: true },
    }),
    prisma.tokenUsage.groupBy({
      by: ['provider'],
      where,
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
      orderBy: { _count: { provider: 'desc' } },
    }),
    prisma.tokenUsage.groupBy({
      by: ['model'],
      where,
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
      orderBy: { _sum: { costUsd: 'desc' } },
    }),
    prisma.tokenUsage.groupBy({
      by: ['endpoint'],
      where,
      _count: { _all: true },
      _sum: { costUsd: true, totalTokens: true },
      orderBy: { _count: { endpoint: 'desc' } },
      take: 8,
    }),
  ]);

  const cached = await prisma.tokenUsage.count({ where: { ...where, cached: true } });
  const total = summary._count._all;

  return {
    summary: {
      requests: total,
      promptTokens: summary._sum.promptTokens ?? 0,
      completionTokens: summary._sum.completionTokens ?? 0,
      totalTokens: summary._sum.totalTokens ?? 0,
      costUsd: roundMoney(summary._sum.costUsd ?? 0),
      avgLatencyMs: Math.round(summary._avg.latencyMs ?? 0),
      cacheHitRate: total > 0 ? Math.round((cached / total) * 1000) / 10 : 0,
    },
    byProvider: byProvider.map((row) => ({
      provider: row.provider,
      requests: row._count._all,
      totalTokens: row._sum.totalTokens ?? 0,
      costUsd: roundMoney(row._sum.costUsd ?? 0),
    })),
    byModel: byModel.map((row) => ({
      model: row.model,
      requests: row._count._all,
      totalTokens: row._sum.totalTokens ?? 0,
      costUsd: roundMoney(row._sum.costUsd ?? 0),
    })),
    byEndpoint: byEndpoint.map((row) => ({
      endpoint: row.endpoint,
      requests: row._count._all,
      totalTokens: row._sum.totalTokens ?? 0,
      costUsd: roundMoney(row._sum.costUsd ?? 0),
    })),
  };
}

export async function getAdminActivity(limit = 20) {
  const take = Math.min(Math.max(limit, 1), 50);

  const [meals, analyses, tokenUsage, apiUsage] = await Promise.all([
    prisma.meal.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        mealType: true,
        totalCalories: true,
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.foodQuery.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        inputType: true,
        provider: true,
        model: true,
        cached: true,
        totalCalories: true,
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.tokenUsage.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        endpoint: true,
        provider: true,
        model: true,
        costUsd: true,
        totalTokens: true,
        user: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.apiUsage.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        endpoint: true,
        statusCode: true,
        latencyMs: true,
        apiKey: {
          select: {
            id: true,
            name: true,
            prefix: true,
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    }),
  ]);

  const items = [
    ...meals.map((meal) => ({
      id: `meal:${meal.id}`,
      type: 'meal' as const,
      createdAt: meal.createdAt,
      title: `${meal.mealType.toLowerCase()} logged`,
      detail: `${Math.round(meal.totalCalories)} kcal`,
      user: meal.user,
    })),
    ...analyses.map((query) => ({
      id: `analysis:${query.id}`,
      type: 'analysis' as const,
      createdAt: query.createdAt,
      title: `${query.inputType.toLowerCase()} food analysis`,
      detail: `${query.provider}/${query.model}${query.cached ? ' · cached' : ''} · ${Math.round(query.totalCalories)} kcal`,
      user: query.user,
    })),
    ...tokenUsage.map((usage) => ({
      id: `token:${usage.id}`,
      type: 'ai_usage' as const,
      createdAt: usage.createdAt,
      title: `${usage.endpoint} AI usage`,
      detail: `${usage.provider}/${usage.model} · ${usage.totalTokens} tokens · $${roundMoney(usage.costUsd)}`,
      user: usage.user,
    })),
    ...apiUsage.map((usage) => ({
      id: `api:${usage.id}`,
      type: 'api_usage' as const,
      createdAt: usage.createdAt,
      title: `${usage.endpoint} public API`,
      detail: `${usage.statusCode} · ${usage.latencyMs}ms · key ${usage.apiKey.prefix}`,
      user: usage.apiKey.user,
    })),
  ];

  return {
    items: items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, take),
  };
}
