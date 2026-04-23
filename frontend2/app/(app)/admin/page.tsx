"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Database, Gauge, Key, Search, Sparkle, Users } from "lucide-react";
import { getAdminActivity, getAdminAiSettings, getAdminOverview, getAdminRuntime, getAdminUsage, listAdminUsers, updateAdminAiSettings } from "@/lib/api/admin";
import type { AdminActivityItem, AdminAiSettings, AdminOverview, AdminRuntimeResponse, AdminUsageResponse, AdminUserRow, UserRole } from "@/lib/api/types";
import { PageHeader, Panel, Stat } from "../_components/ui";

const fallbackUsers = [
  { id: "1", email: "yash@example.com", name: "Yash", role: "USER", createdAt: "", emailVerified: true, goal: "GAIN", notifications: { streakRisk: true, weeklyDigest: true }, counts: { meals: 42, apiKeys: 1, weightEntries: 8, challenges: 3 }, lastMealAt: new Date().toISOString(), ai: { requests: 18, totalTokens: 4200, costUsd: 0.018 } },
  { id: "2", email: "admin@nutriai.app", name: "Admin", role: "ADMIN", createdAt: "", emailVerified: true, goal: "MAINTAIN", notifications: { streakRisk: true, weeklyDigest: true }, counts: { meals: 12, apiKeys: 2, weightEntries: 2, challenges: 1 }, lastMealAt: new Date(Date.now() - 86400000).toISOString(), ai: { requests: 6, totalTokens: 1200, costUsd: 0.006 } },
] satisfies AdminUserRow[];

const fallbackOverview: AdminOverview = {
  users: { total: 128, newThisWeek: 14 },
  meals: { today: 342, thisWeek: 1904 },
  ai: { requestsToday: 1105, tokensToday: 184000, costTodayUsd: 2.18, costThisWeekUsd: 8.42 },
  api: { activeKeys: 9, failedCallsToday: 2 },
};

const fallbackUsage: AdminUsageResponse = {
  summary: { requests: 1105, promptTokens: 82000, completionTokens: 102000, totalTokens: 184000, costUsd: 2.18, avgLatencyMs: 1400, cacheHitRate: 0.18 },
  byProvider: [],
  byModel: [],
  byEndpoint: [
    { endpoint: "food.analyze", requests: 842, totalTokens: 184000, costUsd: 1.42 },
    { endpoint: "chat.send", requests: 219, totalTokens: 91000, costUsd: 0.58 },
    { endpoint: "public.analyze", requests: 44, totalTokens: 23000, costUsd: 0.18 },
  ],
};

const fallbackActivity: AdminActivityItem[] = [
  { id: "a1", type: "analysis", createdAt: new Date().toISOString(), title: "Food analyzed", detail: "yash@example.com analyzed paneer rice bowl", user: null },
  { id: "a2", type: "meal", createdAt: new Date().toISOString(), title: "Meal saved", detail: "coach-test@example.com saved dinner", user: null },
  { id: "a3", type: "api_usage", createdAt: new Date().toISOString(), title: "API warning", detail: "Public API key exceeded soft warning threshold", user: null },
];

const fallbackRuntime: AdminRuntimeResponse = {
  runtime: {
    process: { uptimeSec: 0, memoryMb: 0, nodeEnv: "fallback" },
    http: { totalRequests: 0, total5xx: 0, requestsLastMinute: 0, errorsLastMinute: 0, avgLatencyMsLastMinute: 0 },
    ai: {
      callsLastFiveMinutes: 0,
      freshCallsLastFiveMinutes: 0,
      cachedCallsLastFiveMinutes: 0,
      avgLatencyMsLastFiveMinutes: 0,
      costUsdLastFiveMinutes: 0,
      tokensLastFiveMinutes: 0,
      timeouts: 0,
      queueRejects: 0,
    },
    resilience: { rateLimitBypass: 0 },
  },
  aiGuard: { active: 0, waiting: 0, maxConcurrent: 20, queueTimeoutMs: 2000, requestTimeoutMs: 25000 },
  today: { slowAiCalls: 0, cacheHitRate: 0 },
  slowAiCalls: [],
};

const fallbackAiSettings: AdminAiSettings = {
  aiDailyBudgetUsd: 2,
  aiChatDailyMessageLimit: 5,
  aiChatMaxWords: 100,
  aiChatHistoryWindow: 8,
  aiChatMaxOutputTokens: 220,
  aiFoodTextMaxWords: 40,
  aiImageDailyLimit: 3,
};

function timeAgo(value: string | null) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function AdminPage() {
  const [overview, setOverview] = useState(fallbackOverview);
  const [users, setUsers] = useState<AdminUserRow[]>(fallbackUsers);
  const [usage, setUsage] = useState(fallbackUsage);
  const [runtime, setRuntime] = useState(fallbackRuntime);
  const [activity, setActivity] = useState(fallbackActivity);
  const [aiSettings, setAiSettings] = useState<AdminAiSettings>(fallbackAiSettings);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [usageFrom, setUsageFrom] = useState("");
  const [usageTo, setUsageTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [savingAiSettings, setSavingAiSettings] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAdminOverview(),
      listAdminUsers({ search, role: role === "ALL" ? undefined : role as UserRole, page, limit: 10 }).catch(() => ({ items: fallbackUsers, page: 1, limit: 10, total: fallbackUsers.length, totalPages: 1 })),
      getAdminUsage({ from: usageFrom || undefined, to: usageTo || undefined }).catch(() => fallbackUsage),
      getAdminActivity(10).catch(() => ({ items: fallbackActivity })),
      getAdminRuntime().catch(() => fallbackRuntime),
      getAdminAiSettings().catch(() => fallbackAiSettings),
    ])
      .then(([apiOverview, apiUsers, apiUsage, apiActivity, apiRuntime, apiAiSettings]) => {
        if (cancelled) return;
        setOverview(apiOverview);
        setUsers(apiUsers.items);
        setTotalPages(apiUsers.totalPages);
        setUsage(apiUsage);
        setActivity(apiActivity.items.length ? apiActivity.items : fallbackActivity);
        setRuntime(apiRuntime);
        setAiSettings(apiAiSettings);
        setSource("live");
      })
      .catch(() => setSource("fallback"));
    return () => {
      cancelled = true;
    };
  }, [page, role, search, usageFrom, usageTo]);

  const filteredUsers = useMemo(() => users, [users]);

  function updateAiField<K extends keyof AdminAiSettings>(key: K, value: string) {
    const numeric = Number(value);
    setAiSettings((current) => ({
      ...current,
      [key]: Number.isFinite(numeric) ? numeric : current[key],
    }));
  }

  async function handleSaveAiSettings() {
    setSavingAiSettings(true);
    try {
      const next = await updateAdminAiSettings(aiSettings);
      setAiSettings(next);
      setSource("live");
    } catch {
      setSource("fallback");
    } finally {
      setSavingAiSettings(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow={`Admin · ${source}`} title="Operations, users, usage" />

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Users" value={`${overview.users.total}`} sub={`+${overview.users.newThisWeek} this week`} />
        <Stat label="Meals today" value={`${overview.meals.today}`} sub={`${overview.meals.thisWeek} this week`} />
        <Stat label="AI spend today" value={`$${overview.ai.costTodayUsd.toFixed(2)}`} sub={`${overview.ai.requestsToday} requests`} />
        <Stat label="API keys" value={`${overview.api.activeKeys}`} sub={`${overview.api.failedCallsToday} failed calls today`} />
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/10 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Users size={22} className="text-[#173c2b]" />
              <h2 className="text-[22px] font-semibold">User table</h2>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[13px]">
              <Search size={15} className="text-[#5f675f]" />
              <input className="bg-transparent outline-none" placeholder="Search user" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
            </label>
            <div className="flex rounded-md border border-black/10 bg-[#f8f8f3] p-1">
              {(["ALL", "USER", "ADMIN"] as const).map((item) => (
                <button key={item} onClick={() => { setRole(item); setPage(1); }} className={`rounded px-3 py-1.5 text-[12px] font-bold ${role === item ? "bg-[#173c2b] text-white" : "text-[#5f675f]"}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead className="bg-[#eef5f2] text-[#5f675f]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Verified</th>
                  <th className="px-5 py-3 text-right font-semibold">Meals</th>
                  <th className="px-5 py-3 text-right font-semibold">API keys</th>
                  <th className="px-5 py-3 text-right font-semibold">Weight</th>
                  <th className="px-5 py-3 text-right font-semibold">Challenges</th>
                  <th className="px-5 py-3 font-semibold">Last meal</th>
                  <th className="px-5 py-3 text-right font-semibold">AI spend</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-black/8">
                    <td className="px-5 py-4 font-semibold">{user.email}</td>
                    <td className="px-5 py-4">{user.role}</td>
                    <td className="px-5 py-4">{user.emailVerified ? "Yes" : "No"}</td>
                    <td className="px-5 py-4 text-right">{user.counts.meals}</td>
                    <td className="px-5 py-4 text-right">{user.counts.apiKeys}</td>
                    <td className="px-5 py-4 text-right">{user.counts.weightEntries}</td>
                    <td className="px-5 py-4 text-right">{user.counts.challenges}</td>
                    <td className="px-5 py-4">{timeAgo(user.lastMealAt)}</td>
                    <td className="px-5 py-4 text-right">${user.ai.costUsd.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredUsers.length ? <div className="p-5 text-[13px] font-semibold text-[#5f675f]">No users match the current search and role filter.</div> : null}
          <div className="flex items-center justify-between border-t border-black/10 p-4">
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-md border border-black/10 px-3 py-2 text-[12px] font-bold disabled:opacity-50">Previous</button>
            <span className="text-[12px] font-bold text-[#5f675f]">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-md border border-black/10 px-3 py-2 text-[12px] font-bold disabled:opacity-50">Next</button>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle size={22} className="text-[#b7791f]" />
              <h2 className="text-[20px] font-semibold">Watchlist</h2>
            </div>
            <div className="space-y-3">
              {[
                ["API failures", `${overview.api.failedCallsToday} failed public calls today`],
                ["Unverified users", `${users.filter((user) => !user.emailVerified).length} accounts need email verification`],
                ["AI cost", `$${overview.ai.costThisWeekUsd.toFixed(2)} weekly spend`],
              ].map(([title, sub]) => (
                <div key={title} className="rounded-md bg-[#f8f8f3] p-3">
                  <p className="text-[13px] font-semibold">{title}</p>
                  <p className="mt-1 text-[12px] text-[#5f675f]">{sub}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <Activity size={22} className="text-[#0f8b8d]" />
              <h2 className="text-[20px] font-semibold">Activity</h2>
            </div>
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-md border border-black/8 bg-[#f8f8f3] p-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#0f8b8d]">{item.type}</p>
                  <p className="mt-1 text-[13px] font-semibold">{item.detail || item.title}</p>
                  <p className="mt-1 text-[11px] text-[#5f675f]">{timeAgo(item.createdAt)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-black/10 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Sparkle size={22} className="text-[#0f8b8d]" />
              <h2 className="text-[22px] font-semibold">AI usage by endpoint</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="date" value={usageFrom} onChange={(event) => setUsageFrom(event.target.value)} className="rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[12px] font-bold outline-none" />
              <input type="date" value={usageTo} onChange={(event) => setUsageTo(event.target.value)} className="rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[12px] font-bold outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="bg-[#eef5f2] text-[#5f675f]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Endpoint</th>
                  <th className="px-5 py-3 text-right font-semibold">Requests</th>
                  <th className="px-5 py-3 text-right font-semibold">Tokens</th>
                  <th className="px-5 py-3 text-right font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {usage.byEndpoint.map((row) => (
                  <tr key={row.endpoint} className="border-t border-black/8">
                    <td className="px-5 py-4 font-semibold">{row.endpoint}</td>
                    <td className="px-5 py-4 text-right">{row.requests}</td>
                    <td className="px-5 py-4 text-right">{row.totalTokens}</td>
                    <td className="px-5 py-4 text-right">${row.costUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-5">
        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Key size={22} className="text-[#173c2b]" />
            <h2 className="text-[20px] font-semibold">Platform controls</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Active keys", String(overview.api.activeKeys)],
              ["Rate limit", "enabled"],
              ["Public endpoint", "/v1/public/calories"],
              ["Cache hit rate", `${usage.summary.cacheHitRate}%`],
              ["Avg latency", `${usage.summary.avgLatencyMs}ms`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-[#f8f8f3] p-3">
                <span className="text-[13px] font-semibold">{label}</span>
                <span className="text-[13px] text-[#5f675f]">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-md bg-[#eef5f2] p-3">
            <Database size={18} className="mt-0.5 text-[#173c2b]" />
            <p className="text-[13px] leading-6 text-[#5f675f]">Admin reads stay wired to users, activity, AI spend, API usage, and failed calls.</p>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Sparkle size={22} className="text-[#173c2b]" />
            <h2 className="text-[20px] font-semibold">AI controls</h2>
          </div>
          <div className="grid gap-3">
            {[
              ["Daily budget USD", "aiDailyBudgetUsd"],
              ["Chat messages/day", "aiChatDailyMessageLimit"],
              ["Chat max words", "aiChatMaxWords"],
              ["Chat history window", "aiChatHistoryWindow"],
              ["Chat max output tokens", "aiChatMaxOutputTokens"],
              ["Food text max words", "aiFoodTextMaxWords"],
              ["Image analyses/day", "aiImageDailyLimit"],
            ].map(([label, key]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-md bg-[#f8f8f3] p-3">
                <span className="text-[13px] font-semibold">{label}</span>
                <input
                  type="number"
                  value={String(aiSettings[key as keyof AdminAiSettings])}
                  onChange={(event) => updateAiField(key as keyof AdminAiSettings, event.target.value)}
                  className="w-28 rounded-md border border-black/10 bg-white px-3 py-2 text-right text-[13px] font-semibold outline-none"
                />
              </label>
            ))}
          </div>
          <button
            onClick={handleSaveAiSettings}
            disabled={savingAiSettings}
            className="mt-4 rounded-md bg-[#173c2b] px-4 py-3 text-[13px] font-bold text-white disabled:opacity-50"
          >
            {savingAiSettings ? "Saving..." : "Save AI settings"}
          </button>
        </Panel>
        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Gauge size={22} className="text-[#173c2b]" />
            <h2 className="text-[20px] font-semibold">Runtime load</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Requests/min", `${runtime.runtime.http.requestsLastMinute}`],
              ["HTTP latency", `${runtime.runtime.http.avgLatencyMsLastMinute}ms`],
              ["AI active", `${runtime.aiGuard.active}/${runtime.aiGuard.maxConcurrent}`],
              ["AI waiting", `${runtime.aiGuard.waiting}`],
              ["AI timeouts", `${runtime.runtime.ai.timeouts}`],
              ["Rate limit bypass", `${runtime.runtime.resilience.rateLimitBypass}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-[#f8f8f3] p-3">
                <span className="text-[13px] font-semibold">{label}</span>
                <span className="text-[13px] text-[#5f675f]">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-5 text-[#5f675f]">
            AI guard: {runtime.aiGuard.requestTimeoutMs}ms timeout · {runtime.aiGuard.queueTimeoutMs}ms queue wait.
          </p>
        </Panel>
        <Panel className="p-5">
          <h2 className="mb-4 text-[20px] font-semibold">Provider mix</h2>
          <div className="space-y-2">
            {(usage.byProvider.length ? usage.byProvider : [{ provider: "openai", requests: usage.summary.requests, totalTokens: usage.summary.totalTokens, costUsd: usage.summary.costUsd }]).map((row) => (
              <div key={row.provider} className="rounded-md bg-[#f8f8f3] p-3">
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold">{row.provider}</span>
                  <span className="text-[#5f675f]">${row.costUsd.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#5f675f]">{row.requests} requests · {row.totalTokens} tokens</p>
              </div>
            ))}
          </div>
        </Panel>
        </div>
      </section>
    </div>
  );
}
