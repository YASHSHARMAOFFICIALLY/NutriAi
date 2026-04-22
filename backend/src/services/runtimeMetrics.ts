interface HttpSample {
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  at: number;
}

interface AiSample {
  endpoint: string;
  provider: string;
  model: string;
  cached: boolean;
  latencyMs: number;
  costUsd: number;
  totalTokens: number;
  at: number;
}

const startedAt = Date.now();
const httpSamples: HttpSample[] = [];
const aiSamples: AiSample[] = [];
const counters = {
  httpRequests: 0,
  httpErrors: 0,
  rateLimitBypass: 0,
  aiTimeouts: 0,
  aiQueueRejects: 0,
};

const MAX_SAMPLES = 1000;

const pushBounded = <T>(items: T[], item: T) => {
  items.push(item);
  if (items.length > MAX_SAMPLES) items.splice(0, items.length - MAX_SAMPLES);
};

const average = (nums: number[]) => {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length);
};

const since = (windowMs: number) => Date.now() - windowMs;

export const recordHttpRequest = (sample: Omit<HttpSample, 'at'>): void => {
  counters.httpRequests += 1;
  if (sample.statusCode >= 500) counters.httpErrors += 1;
  pushBounded(httpSamples, { ...sample, at: Date.now() });
};

export const recordAiUsageMetric = (sample: Omit<AiSample, 'at'>): void => {
  pushBounded(aiSamples, { ...sample, at: Date.now() });
};

export const recordRateLimitBypass = (): void => {
  counters.rateLimitBypass += 1;
};

export const recordAiTimeout = (): void => {
  counters.aiTimeouts += 1;
};

export const recordAiQueueReject = (): void => {
  counters.aiQueueRejects += 1;
};

export const getRuntimeMetrics = () => {
  const oneMinuteAgo = since(60_000);
  const fiveMinutesAgo = since(5 * 60_000);
  const recentHttp = httpSamples.filter((s) => s.at >= oneMinuteAgo);
  const recentAi = aiSamples.filter((s) => s.at >= fiveMinutesAgo);
  const recentErrors = recentHttp.filter((s) => s.statusCode >= 500);
  const recentAiFresh = recentAi.filter((s) => !s.cached);
  const recentAiCached = recentAi.filter((s) => s.cached);

  return {
    process: {
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      nodeEnv: process.env.NODE_ENV ?? 'development',
    },
    http: {
      totalRequests: counters.httpRequests,
      total5xx: counters.httpErrors,
      requestsLastMinute: recentHttp.length,
      errorsLastMinute: recentErrors.length,
      avgLatencyMsLastMinute: average(recentHttp.map((s) => s.latencyMs)),
    },
    ai: {
      callsLastFiveMinutes: recentAi.length,
      freshCallsLastFiveMinutes: recentAiFresh.length,
      cachedCallsLastFiveMinutes: recentAiCached.length,
      avgLatencyMsLastFiveMinutes: average(recentAi.map((s) => s.latencyMs)),
      costUsdLastFiveMinutes:
        Math.round(recentAi.reduce((sum, s) => sum + s.costUsd, 0) * 10_000) / 10_000,
      tokensLastFiveMinutes: recentAi.reduce((sum, s) => sum + s.totalTokens, 0),
      timeouts: counters.aiTimeouts,
      queueRejects: counters.aiQueueRejects,
    },
    resilience: {
      rateLimitBypass: counters.rateLimitBypass,
    },
  };
};
