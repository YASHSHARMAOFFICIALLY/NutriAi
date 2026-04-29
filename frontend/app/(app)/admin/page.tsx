"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AddressBook, Gauge, Key, MagnifyingGlass, Pulse, SealWarning, Sparkle } from "@phosphor-icons/react";
import { getAdminActivity, getAdminAiSettings, getAdminOverview, getAdminRuntime, getAdminUsage, getAdminUserDetail, listAdminUsers, updateAdminAiSettings } from "@/lib/api/admin";
import type { AdminActivityItem, AdminAiSettings, AdminOverview, AdminRuntimeResponse, AdminUsageResponse, AdminUserDetail, AdminUserRow, UserRole } from "@/lib/api/types";
import { PageHeader, Panel, Stat } from "../_components/ui";

const emptyOverview: AdminOverview = {
  users: { total: 0, newThisWeek: 0 },
  meals: { today: 0, thisWeek: 0 },
  ai: { requestsToday: 0, tokensToday: 0, costTodayUsd: 0, costThisWeekUsd: 0 },
  api: { activeKeys: 0, failedCallsToday: 0 },
};

const emptyUsage: AdminUsageResponse = {
  summary: { requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0, avgLatencyMs: 0, cacheHitRate: 0 },
  byProvider: [],
  byModel: [],
  byEndpoint: [],
};

const emptyRuntime: AdminRuntimeResponse = {
  runtime: {
    process: { uptimeSec: 0, memoryMb: 0, nodeEnv: "unknown" },
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

const emptyAiSettings: AdminAiSettings = {
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

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-[#f8f8f3] p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f675f]">{label}</p>
      <div className="mt-1 break-words text-[13px] font-semibold">{value ?? "-"}</div>
    </div>
  );
}

function DetailList({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[18px] font-semibold">{title}</h3>
      {empty ? <p className="rounded-md bg-[#f8f8f3] p-3 text-[13px] font-semibold text-[#5f675f]">No records yet.</p> : children}
    </section>
  );
}

function formatFeatureName(value: string) {
  return value
    .replace(/^\/v\d+\//, "")
    .replace(/[._/-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminPage() {
  const [overview, setOverview] = useState(emptyOverview);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usage, setUsage] = useState(emptyUsage);
  const [runtime, setRuntime] = useState(emptyRuntime);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [aiSettings, setAiSettings] = useState<AdminAiSettings>(emptyAiSettings);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [usageFrom, setUsageFrom] = useState("");
  const [usageTo, setUsageTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [source, setSource] = useState<"loading" | "live" | "error">("loading");
  const [savingAiSettings, setSavingAiSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [userDetailsById, setUserDetailsById] = useState<Record<string, AdminUserDetail>>({});
  const [tableDetailsLoading, setTableDetailsLoading] = useState(false);
  const [userDetailStatus, setUserDetailStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAdminOverview(),
      listAdminUsers({ search, role: role === "ALL" ? undefined : role as UserRole, page, limit: 10 }),
      getAdminUsage({ from: usageFrom || undefined, to: usageTo || undefined }),
      getAdminActivity(10),
      getAdminRuntime(),
      getAdminAiSettings(),
    ])
      .then(async ([apiOverview, apiUsers, apiUsage, apiActivity, apiRuntime, apiAiSettings]) => {
        if (cancelled) return;
        setOverview(apiOverview);
        setUsers(apiUsers.items);
        setTotalPages(apiUsers.totalPages);
        setUsage(apiUsage);
        setActivity(apiActivity.items);
        setRuntime(apiRuntime);
        setAiSettings(apiAiSettings);
        setSource("live");
        if (!apiUsers.items.length) {
          setSelectedUser(null);
          setUserDetailsById({});
          setUserDetailStatus("idle");
          return;
        }
        setTableDetailsLoading(true);
        const detailResults = await Promise.allSettled(apiUsers.items.map((user) => getAdminUserDetail(user.id)));
        if (cancelled) return;
        const details = detailResults.reduce<Record<string, AdminUserDetail>>((acc, result) => {
          if (result.status === "fulfilled") acc[result.value.id] = result.value;
          return acc;
        }, {});
        setUserDetailsById(details);
        setSelectedUser(details[apiUsers.items[0].id] ?? null);
        setUserDetailStatus(Object.keys(details).length ? "idle" : "error");
        setTableDetailsLoading(false);
      })
      .catch(() => {
        setSource("error");
        setTableDetailsLoading(false);
      });
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
      setSource("error");
    } finally {
      setSavingAiSettings(false);
    }
  }

  async function handleOpenUser(id: string) {
    setUserDetailStatus("loading");
    try {
      const detail = await getAdminUserDetail(id);
      setSelectedUser(detail);
      setUserDetailsById((current) => ({ ...current, [detail.id]: detail }));
      setUserDetailStatus("idle");
    } catch {
      setUserDetailStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow={`Admin · ${source}`} title="Operations, users, usage" />
      {source === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load admin data. Sign in with an admin account and try again.</p>
        </Panel>
      ) : null}

      <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Users" value={`${overview.users.total}`} sub={`+${overview.users.newThisWeek} this week`} />
        <Stat label="Meals today" value={`${overview.meals.today}`} sub={`${overview.meals.thisWeek} this week`} />
        <Stat label="Usage today" value={`$${overview.ai.costTodayUsd.toFixed(2)}`} sub={`${overview.ai.requestsToday} requests`} />
        <Stat label="API keys" value={`${overview.api.activeKeys}`} sub={`${overview.api.failedCallsToday} failed calls today`} />
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/10 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <AddressBook size={22} className="text-[#173c2b]" />
              <h2 className="text-[22px] font-semibold">User table</h2>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-black/10 bg-[#f8f8f3] px-3 py-2 text-[13px]">
              <MagnifyingGlass size={15} className="text-[#5f675f]" />
              <input className="bg-transparent outline-none" placeholder="Search user" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
            </label>
            <div className="flex rounded-md border border-black/10 bg-[#f8f8f3] p-1">
              {(["ALL", "USER", "ADMIN"] as const).map((item) => (
                <button key={item} onClick={() => { setRole(item); setPage(1); }} className={`rounded px-3 py-1.5 text-[12px] font-bold ${role === item ? "bg-[#173c2b] text-white" : "text-[#5f675f]"}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-left text-[13px]">
              <thead className="bg-[#eef5f2] text-[#5f675f]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Verified</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">IP</th>
                  <th className="px-5 py-3 font-semibold">Device</th>
                  <th className="px-5 py-3 font-semibold">Last session</th>
                  <th className="px-5 py-3 text-right font-semibold">Sessions</th>
                  <th className="px-5 py-3 text-right font-semibold">Meals</th>
                  <th className="px-5 py-3 text-right font-semibold">API keys</th>
                  <th className="px-5 py-3 text-right font-semibold">Weight</th>
                  <th className="px-5 py-3 text-right font-semibold">Challenges</th>
                  <th className="px-5 py-3 font-semibold">Last meal</th>
                  <th className="px-5 py-3 text-right font-semibold">Usage</th>
                  <th className="px-5 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const detail = userDetailsById[user.id];
                  const latestSession = detail?.sessions[0];
                  const device = [latestSession?.deviceModel, latestSession?.os, latestSession?.browser].filter(Boolean).join(" · ");
                  return (
                    <tr key={user.id} className={`border-t border-black/8 ${selectedUser?.id === user.id ? "bg-[#eef5f2]" : ""}`}>
                      <td className="px-5 py-4 font-semibold">{user.email}</td>
                      <td className="px-5 py-4">{user.role}</td>
                      <td className="px-5 py-4">{user.emailVerified ? "Yes" : "No"}</td>
                      <td className="max-w-[180px] px-5 py-4">
                        <span className="line-clamp-2">{latestSession?.location || (tableDetailsLoading ? "Loading..." : "-")}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-[12px]">{latestSession?.ipAddress || "-"}</td>
                      <td className="max-w-[210px] px-5 py-4">
                        <span className="line-clamp-2">{device || "-"}</span>
                      </td>
                      <td className="px-5 py-4">{latestSession ? timeAgo(latestSession.lastSeenAt) : "-"}</td>
                      <td className="px-5 py-4 text-right">{detail?._count.sessions ?? "-"}</td>
                      <td className="px-5 py-4 text-right">{user.counts.meals}</td>
                      <td className="px-5 py-4 text-right">{user.counts.apiKeys}</td>
                      <td className="px-5 py-4 text-right">{user.counts.weightEntries}</td>
                      <td className="px-5 py-4 text-right">{user.counts.challenges}</td>
                      <td className="px-5 py-4">{timeAgo(user.lastMealAt)}</td>
                      <td className="px-5 py-4 text-right">${user.ai.costUsd.toFixed(3)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleOpenUser(user.id)} className="rounded-md bg-[#173c2b] px-3 py-2 text-[11px] font-bold text-white">
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              <SealWarning size={22} className="text-[#b7791f]" />
              <h2 className="text-[20px] font-semibold">Watchlist</h2>
            </div>
            <div className="space-y-3">
              {[
                ["API failures", `${overview.api.failedCallsToday} failed public calls today`],
                ["Unverified users", `${users.filter((user) => !user.emailVerified).length} accounts need email verification`],
                ["Usage", `$${overview.ai.costThisWeekUsd.toFixed(2)} weekly total`],
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
              <Pulse size={22} className="text-[#0f8b8d]" />
              <h2 className="text-[20px] font-semibold">Activity</h2>
            </div>
            <div className="space-y-3">
              {activity.length ? activity.map((item) => (
                <div key={item.id} className="rounded-md border border-black/8 bg-[#f8f8f3] p-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#0f8b8d]">{item.type}</p>
                  <p className="mt-1 text-[13px] font-semibold">{item.detail || item.title}</p>
                  <p className="mt-1 text-[11px] text-[#5f675f]">{timeAgo(item.createdAt)}</p>
                </div>
              )) : <p className="text-[13px] font-semibold text-[#5f675f]">No recent activity.</p>}
            </div>
          </Panel>
        </div>
      </section>

      {userDetailStatus === "error" ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load selected user details.</p>
        </Panel>
      ) : null}

      {selectedUser ? (
        <Panel className="mb-5 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-black/10 bg-[#eef5f2] p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f8b8d]">Full user record</p>
              <h2 className="mt-1 text-[28px] font-semibold">{selectedUser.email}</h2>
              <p className="mt-1 text-[13px] text-[#5f675f]">{selectedUser.id}</p>
            </div>
            <button onClick={() => setSelectedUser(null)} className="rounded-md border border-black/10 bg-white px-3 py-2 text-[12px] font-bold">Close</button>
          </div>

          <div className="grid gap-5 p-5 xl:grid-cols-[1fr_420px]">
            <div className="space-y-5">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Sessions" value={selectedUser._count.sessions} />
                <Field label="Meals" value={selectedUser._count.meals} />
                <Field label="Weight logs" value={selectedUser._count.weightEntries} />
                <Field label="Developer keys" value={selectedUser._count.apiKeys} />
              </section>

              <section>
                <h3 className="mb-3 text-[18px] font-semibold">Identity and permission</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Name" value={selectedUser.name || "-"} />
                  <Field label="Role" value={selectedUser.role} />
                  <Field label="Verified" value={selectedUser.emailVerified ? "Yes" : "No"} />
                  <Field label="Verified at" value={formatDateTime(selectedUser.emailVerifiedAt)} />
                  <Field label="Google ID" value={selectedUser.googleId || "-"} />
                  <Field label="Avatar" value={selectedUser.avatarUrl ? "Available" : "-"} />
                  <Field label="Created" value={formatDateTime(selectedUser.createdAt)} />
                  <Field label="Updated" value={formatDateTime(selectedUser.updatedAt)} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[18px] font-semibold">Location, device, sessions</h3>
                <div className="space-y-3">
                  {selectedUser.sessions.map((session) => (
                    <div key={session.id} className="rounded-md border border-black/8 bg-white p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <Field label="Location" value={session.location || "Not provided by edge headers"} />
                        <Field label="IP address" value={session.ipAddress || "-"} />
                        <Field label="Phone/model" value={session.deviceModel || "Unknown"} />
                        <Field label="Device type" value={session.deviceType || "-"} />
                        <Field label="OS" value={session.os || "-"} />
                        <Field label="Browser" value={session.browser || "-"} />
                        <Field label="First seen" value={formatDateTime(session.createdAt)} />
                        <Field label="Last seen" value={formatDateTime(session.lastSeenAt)} />
                        <Field label="Access expires" value={formatDateTime(session.refreshToken.expiresAt)} />
                        <Field label="Session" value={session.revokedAt ? "Revoked" : "Active"} />
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-[12px] font-bold text-[#0f8b8d]">User agent</summary>
                        <p className="mt-2 break-all rounded-md bg-[#f8f8f3] p-3 text-[11px] text-[#5f675f]">{session.userAgent || "-"}</p>
                      </details>
                    </div>
                  ))}
                  {!selectedUser.sessions.length ? <p className="text-[13px] font-semibold text-[#5f675f]">No tracked sessions yet. New logins/refreshes will populate this.</p> : null}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[18px] font-semibold">Nutrition profile</h3>
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Sex" value={selectedUser.profile?.sex || "-"} />
                  <Field label="Birth year" value={selectedUser.profile?.birthYear || "-"} />
                  <Field label="Height" value={selectedUser.profile?.heightCm ? `${selectedUser.profile.heightCm} cm` : "-"} />
                  <Field label="Weight" value={selectedUser.profile?.weightKg ? `${selectedUser.profile.weightKg} kg` : "-"} />
                  <Field label="Target weight" value={selectedUser.profile?.targetWeightKg ? `${selectedUser.profile.targetWeightKg} kg` : "-"} />
                  <Field label="Goal" value={selectedUser.profile?.goal || "-"} />
                  <Field label="Activity" value={selectedUser.profile?.activityLevel || "-"} />
                  <Field label="Timezone" value={selectedUser.profile?.timezone || "-"} />
                  <Field label="Budget" value={selectedUser.profile?.dailyBudgetUsd ?? "-"} />
                  <Field label="Cal target" value={selectedUser.profile?.dailyCalorieTarget ?? "-"} />
                  <Field label="Protein" value={selectedUser.profile?.proteinTargetG ?? "-"} />
                  <Field label="Carbs" value={selectedUser.profile?.carbsTargetG ?? "-"} />
                  <Field label="Fat" value={selectedUser.profile?.fatTargetG ?? "-"} />
                  <Field label="Diet prefs" value={selectedUser.profile?.dietaryPrefs.length ? selectedUser.profile.dietaryPrefs.join(", ") : "-"} />
                  <Field label="Allergies" value={selectedUser.profile?.allergies.length ? selectedUser.profile.allergies.join(", ") : "-"} />
                  <Field label="Streak risk alert" value={selectedUser.profile?.notifyStreakRisk ? "On" : "Off"} />
                  <Field label="Weekly digest" value={selectedUser.profile?.notifyWeeklyDigest ? "On" : "Off"} />
                </div>
              </section>

              <DetailList title="Recent meals" empty={!selectedUser.meals.length}>
                <div className="space-y-3">
                  {selectedUser.meals.map((meal) => (
                    <div key={meal.id} className="rounded-md border border-black/8 bg-white p-4">
                      <div className="grid gap-3 md:grid-cols-4">
                        <Field label="Meal" value={meal.mealType} />
                        <Field label="Logged" value={formatDateTime(meal.loggedAt)} />
                        <Field label="Calories" value={Math.round(meal.totalCalories)} />
                        <Field label="Macros" value={`${Math.round(meal.totalProtein)}P · ${Math.round(meal.totalCarbs)}C · ${Math.round(meal.totalFat)}F`} />
                      </div>
                      <p className="mt-3 text-[12px] leading-5 text-[#5f675f]">{meal.items.map((item) => item.name).join(", ") || "No items recorded."}</p>
                    </div>
                  ))}
                </div>
              </DetailList>

              <DetailList title="Weight history" empty={!selectedUser.weightEntries.length}>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedUser.weightEntries.map((entry) => (
                    <Field key={entry.id} label={`${entry.weightKg} kg`} value={`${formatDateTime(entry.recordedAt)}${entry.note ? ` · ${entry.note}` : ""}`} />
                  ))}
                </div>
              </DetailList>

              <DetailList title="Food scan history" empty={!selectedUser.foodQueries.length}>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedUser.foodQueries.map((query) => (
                    <Field
                      key={query.id}
                      label={`${query.inputType} · ${formatDateTime(query.createdAt)}`}
                      value={`${Math.round(query.totals.calories)} cal · ${query.items.map((item) => item.name).join(", ") || query.inputText || "No item names"}`}
                    />
                  ))}
                </div>
              </DetailList>
            </div>

            <aside className="space-y-5">
              <Panel className="p-5">
                <h3 className="mb-3 text-[18px] font-semibold">Usage summary</h3>
                <div className="grid gap-3">
                  <Field label="Requests" value={selectedUser.aiSummary.requests} />
                  <Field label="Cost" value={`$${selectedUser.aiSummary.costUsd.toFixed(4)}`} />
                </div>
              </Panel>
              <Panel className="p-5">
                <h3 className="mb-3 text-[18px] font-semibold">Account data</h3>
                <div className="grid gap-3">
                  <Field label="Saved chats" value={selectedUser._count.conversations} />
                  <Field label="Uploaded files" value={selectedUser._count.assets} />
                  <Field label="Challenges" value={selectedUser._count.userChallenges} />
                  <Field label="Analysis records" value={selectedUser._count.foodQueries} />
                </div>
              </Panel>
              <Panel className="p-5">
                <h3 className="mb-3 text-[18px] font-semibold">Integrations</h3>
                <div className="grid gap-3">
                  <Field label="Telegram" value={selectedUser.telegramAccount ? "Linked" : "Not linked"} />
                  <Field label="Families owned" value={selectedUser.ownedFamilies.length} />
                  <Field label="Family memberships" value={selectedUser.familyMemberships.length} />
                  <Field label="Invites sent" value={selectedUser.familyInvitesSent.length} />
                </div>
              </Panel>
              <Panel className="p-5">
                <DetailList title="Developer keys" empty={!selectedUser.apiKeys.length}>
                  <div className="space-y-3">
                    {selectedUser.apiKeys.map((key) => (
                      <div key={key.id} className="rounded-md bg-[#f8f8f3] p-3">
                        <p className="text-[13px] font-semibold">{key.name}</p>
                        <p className="mt-1 text-[12px] text-[#5f675f]">{key.prefix} · {key.revokedAt ? "Revoked" : "Active"} · {key._count.usage} calls</p>
                        <p className="mt-1 text-[11px] text-[#5f675f]">Last used {timeAgo(key.lastUsedAt)}</p>
                      </div>
                    ))}
                  </div>
                </DetailList>
              </Panel>
              <Panel className="p-5">
                <DetailList title="Recent chats" empty={!selectedUser.conversations.length}>
                  <div className="space-y-3">
                    {selectedUser.conversations.map((conversation) => (
                      <div key={conversation.id} className="rounded-md bg-[#f8f8f3] p-3">
                        <p className="text-[13px] font-semibold">{conversation.title || "Untitled chat"}</p>
                        <p className="mt-1 text-[12px] text-[#5f675f]">{conversation.messages.length} messages · updated {timeAgo(conversation.updatedAt)}</p>
                      </div>
                    ))}
                  </div>
                </DetailList>
              </Panel>
              <Panel className="p-5">
                <DetailList title="Files" empty={!selectedUser.assets.length}>
                  <div className="space-y-3">
                    {selectedUser.assets.map((asset) => (
                      <div key={asset.id} className="rounded-md bg-[#f8f8f3] p-3">
                        <p className="text-[13px] font-semibold">{asset.contentType}</p>
                        <p className="mt-1 text-[12px] text-[#5f675f]">{asset.status} · {asset.size ? `${Math.round(asset.size / 1024)} KB` : "size unknown"}</p>
                        <p className="mt-1 text-[11px] text-[#5f675f]">Uploaded {formatDateTime(asset.uploadedAt)}</p>
                      </div>
                    ))}
                  </div>
                </DetailList>
              </Panel>
              <Panel className="p-5">
                <DetailList title="Challenges" empty={!selectedUser.userChallenges.length}>
                  <div className="space-y-3">
                    {selectedUser.userChallenges.map((challenge) => (
                      <div key={challenge.id} className="rounded-md bg-[#f8f8f3] p-3">
                        <p className="text-[13px] font-semibold">{challenge.title}</p>
                        <p className="mt-1 text-[12px] text-[#5f675f]">{challenge.status} · {challenge.daysCheckedIn}/{challenge.durationDays} days</p>
                      </div>
                    ))}
                  </div>
                </DetailList>
              </Panel>
            </aside>
          </div>

        </Panel>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-black/10 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Sparkle size={22} className="text-[#0f8b8d]" />
              <h2 className="text-[22px] font-semibold">Feature usage</h2>
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
                  <th className="px-5 py-3 font-semibold">Feature</th>
                  <th className="px-5 py-3 text-right font-semibold">Requests</th>
                  <th className="px-5 py-3 text-right font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {usage.byEndpoint.map((row) => (
                  <tr key={row.endpoint} className="border-t border-black/8">
                    <td className="px-5 py-4 font-semibold">{formatFeatureName(row.endpoint)}</td>
                    <td className="px-5 py-4 text-right">{row.requests}</td>
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
              ["Public tool", "calorie lookup"],
              ["Repeat savings", `${usage.summary.cacheHitRate}%`],
              ["Average response", usage.summary.avgLatencyMs > 0 ? "tracked" : "not tracked"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-[#f8f8f3] p-3">
                <span className="text-[13px] font-semibold">{label}</span>
                <span className="text-[13px] text-[#5f675f]">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-md bg-[#eef5f2] p-3 text-[13px] leading-6 text-[#5f675f]">Admin views show users, activity, usage, and failed calls.</p>
        </Panel>
        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Sparkle size={22} className="text-[#173c2b]" />
            <h2 className="text-[20px] font-semibold">Smart scan controls</h2>
          </div>
          <div className="grid gap-3">
            {[
              ["Daily budget USD", "aiDailyBudgetUsd"],
              ["Chat messages/day", "aiChatDailyMessageLimit"],
              ["Chat max words", "aiChatMaxWords"],
              ["Chat history window", "aiChatHistoryWindow"],
              ["Chat response size", "aiChatMaxOutputTokens"],
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
            {savingAiSettings ? "Saving..." : "Save scan settings"}
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
              ["Response status", runtime.runtime.http.avgLatencyMsLastMinute > 0 ? "tracked" : "quiet"],
              ["Active work", `${runtime.aiGuard.active}/${runtime.aiGuard.maxConcurrent}`],
              ["Waiting work", `${runtime.aiGuard.waiting}`],
              ["Timeouts", `${runtime.runtime.ai.timeouts}`],
              ["Rate limit bypass", `${runtime.runtime.resilience.rateLimitBypass}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-[#f8f8f3] p-3">
                <span className="text-[13px] font-semibold">{label}</span>
                <span className="text-[13px] text-[#5f675f]">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-5 text-[#5f675f]">Operational limits are active.</p>
        </Panel>
        <Panel className="p-5">
          <h2 className="mb-4 text-[20px] font-semibold">Usage mix</h2>
          <div className="space-y-2">
            {usage.byEndpoint.length ? usage.byEndpoint.map((row) => (
              <div key={row.endpoint} className="rounded-md bg-[#f8f8f3] p-3">
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold">{formatFeatureName(row.endpoint)}</span>
                  <span className="text-[#5f675f]">${row.costUsd.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#5f675f]">{row.requests} requests</p>
              </div>
            )) : <p className="text-[13px] font-semibold text-[#5f675f]">No usage in this range.</p>}
          </div>
        </Panel>
        </div>
      </section>
    </div>
  );
}
