import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { getAiGuardState } from '../ai/guard';
import { getRuntimeMetrics } from './runtimeMetrics';
import { roundMoney } from '../utils/number';
import {
  getAiSettings,
  type UpdateAiSettingsInput,
  updateAiSettings,
} from './appSettingsService';

const startOfToday = (): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

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
    premiumUsers,
    visitsToday,
    uniqueVisitorsToday,
    activeAccountsToday,
    mealsToday,
    mealsThisWeek,
    aiToday,
    aiWeek,
    activeApiKeys,
    failedApiCallsToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: week } } }),
    prisma.subscription.count({
      where: { tier: 'PRO', status: { in: ['ACTIVE', 'PAST_DUE'] } },
    }),
    prisma.pageVisit.count({ where: { createdAt: { gte: today } } }),
    prisma.pageVisit.findMany({
      where: { createdAt: { gte: today }, visitorId: { not: null } },
      distinct: ['visitorId'],
      select: { visitorId: true },
    }),
    prisma.userSession.count({ where: { lastSeenAt: { gte: today } } }),
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
    users: {
      total: totalUsers,
      newThisWeek: newUsersThisWeek,
      premium: premiumUsers,
      free: Math.max(totalUsers - premiumUsers, 0),
      activeToday: activeAccountsToday,
    },
    visits: {
      today: visitsToday,
      uniqueToday: uniqueVisitorsToday.length,
    },
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

export async function getAdminAiSettings() {
  return getAiSettings();
}

export async function saveAdminAiSettings(input: UpdateAiSettingsInput) {
  return updateAiSettings(input);
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
        subscription: {
          select: {
            tier: true,
            status: true,
            dodoSubscriptionId: true,
            dodoCustomerId: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelledAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        profile: { select: { goal: true, notifyStreakRisk: true, notifyWeeklyDigest: true } },
        sessions: {
          orderBy: { lastSeenAt: 'desc' },
          take: 1,
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            deviceType: true,
            deviceModel: true,
            os: true,
            browser: true,
            location: true,
            createdAt: true,
            lastSeenAt: true,
            revokedAt: true,
          },
        },
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
            sessions: true,
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
      subscription:
        user.subscription ?? {
          tier: 'FREE',
          status: 'ACTIVE',
          dodoSubscriptionId: null,
          dodoCustomerId: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelledAt: null,
          createdAt: null,
          updatedAt: null,
        },
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
        sessions: user._count.sessions,
      },
      latestSession: user.sessions[0] ?? null,
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

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      googleId: true,
      email: true,
      name: true,
      avatarUrl: true,
      emailVerified: true,
      emailVerifiedAt: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      subscription: {
        select: {
          tier: true,
          status: true,
          dodoSubscriptionId: true,
          dodoCustomerId: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelledAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          dodoPaymentId: true,
          type: true,
          status: true,
          amountCents: true,
          currency: true,
          productId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      profile: true,
      sessions: {
        orderBy: { lastSeenAt: 'desc' },
        take: 25,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          deviceType: true,
          deviceModel: true,
          os: true,
          browser: true,
          location: true,
          createdAt: true,
          lastSeenAt: true,
          revokedAt: true,
          refreshToken: { select: { expiresAt: true, revokedAt: true, createdAt: true } },
        },
      },
      refreshTokens: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, expiresAt: true, revokedAt: true, createdAt: true },
      },
      meals: {
        orderBy: { loggedAt: 'desc' },
        take: 50,
        include: { items: true },
      },
      foodQueries: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { items: true, asset: true },
      },
      weightEntries: {
        orderBy: { recordedAt: 'desc' },
        take: 50,
      },
      conversations: {
        orderBy: { updatedAt: 'desc' },
        take: 25,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      assets: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      apiKeys: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: {
          id: true,
          name: true,
          prefix: true,
          scopes: true,
          rateLimitPerMin: true,
          lastUsedAt: true,
          revokedAt: true,
          createdAt: true,
          _count: { select: { usage: true } },
          usage: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              endpoint: true,
              statusCode: true,
              latencyMs: true,
              createdAt: true,
            },
          },
        },
      },
      tokenUsage: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      userChallenges: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: { challenge: true },
      },
      telegramAccount: true,
      ownedFamilies: {
        orderBy: { createdAt: 'desc' },
        include: {
          members: { include: { user: { select: { id: true, email: true, name: true } } } },
          invites: true,
        },
      },
      familyMemberships: {
        orderBy: { joinedAt: 'desc' },
        include: {
          family: { select: { id: true, name: true, ownerId: true } },
        },
      },
      familyInvitesSent: {
        orderBy: { createdAt: 'desc' },
        take: 25,
      },
      emailVerificationTokens: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, expiresAt: true, usedAt: true, createdAt: true },
      },
      passwordResetTokens: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, expiresAt: true, usedAt: true, createdAt: true },
      },
      telegramLinkTokens: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, expiresAt: true, usedAt: true, createdAt: true },
      },
      telegramPendingActions: {
        orderBy: { createdAt: 'desc' },
        take: 25,
      },
      _count: {
        select: {
          meals: true,
          foodQueries: true,
          conversations: true,
          assets: true,
          apiKeys: true,
          tokenUsage: true,
          userChallenges: true,
          weightEntries: true,
          refreshTokens: true,
          sessions: true,
        },
      },
    },
  });

  if (!user) return null;

  const aiAggregate = await prisma.tokenUsage.aggregate({
    where: { userId },
    _count: { _all: true },
    _sum: { promptTokens: true, completionTokens: true, totalTokens: true, costUsd: true },
    _avg: { latencyMs: true },
  });

  return {
    ...user,
    goal: user.profile?.goal ?? null,
    subscription:
      user.subscription ?? {
        tier: 'FREE',
        status: 'ACTIVE',
        dodoSubscriptionId: null,
        dodoCustomerId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelledAt: null,
        createdAt: null,
        updatedAt: null,
      },
    notifications: {
      streakRisk: user.profile?.notifyStreakRisk ?? false,
      weeklyDigest: user.profile?.notifyWeeklyDigest ?? false,
    },
    counts: {
      meals: user._count.meals,
      apiKeys: user._count.apiKeys,
      weightEntries: user._count.weightEntries,
      challenges: user._count.userChallenges,
      sessions: user._count.sessions,
    },
    latestSession: user.sessions[0] ?? null,
    lastMealAt: user.meals[0]?.loggedAt ?? null,
    ai: {
      requests: aiAggregate._count._all,
      totalTokens: aiAggregate._sum.totalTokens ?? 0,
      costUsd: roundMoney(aiAggregate._sum.costUsd ?? 0),
    },
    aiSummary: {
      requests: aiAggregate._count._all,
      promptTokens: aiAggregate._sum.promptTokens ?? 0,
      completionTokens: aiAggregate._sum.completionTokens ?? 0,
      totalTokens: aiAggregate._sum.totalTokens ?? 0,
      costUsd: roundMoney(aiAggregate._sum.costUsd ?? 0),
      avgLatencyMs: Math.round(aiAggregate._avg.latencyMs ?? 0),
    },
    weightEntries: user.weightEntries.map((entry) => ({
      ...entry,
      weightKg: Number(entry.weightKg),
    })),
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
