"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Pulse,
  ChartBar,
  Clock,
  CurrencyDollar,
  Database,
  ForkKnife,
  Key,
  MagnifyingGlass,
  Sparkle,
  Users,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import {
  getAdminActivity,
  getAdminOverview,
  getAdminUsage,
  listAdminUsers,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type {
  AdminActivityItem,
  AdminOverview,
  AdminUsageResponse,
  AdminUserRow,
  AdminUsersResponse,
  UserRole,
} from "@/lib/api/types";
import { EmptyState, ErrorState, LoadingState } from "../_components/AppState";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Tab = "overview" | "users" | "usage" | "activity";

const TABS: Array<{ id: Tab; label: string; icon: typeof ChartBar }> = [
  { id: "overview", label: "Overview", icon: ChartBar },
  { id: "users", label: "Users", icon: Users },
  { id: "usage", label: "Usage", icon: Sparkle },
  { id: "activity", label: "Activity", icon: Pulse },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

const number = new Intl.NumberFormat("en-US");

function relDate(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof ChartBar;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_10px_40px_rgba(31,59,45,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 text-sage-600">
          <Icon size={16} weight="duotone" />
        </span>
      </div>
      <p className="font-display text-[30px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[12px] text-ink-muted">{sub}</p>
    </motion.div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        role === "ADMIN" ? "bg-forest/10 text-forest" : "bg-ink/[0.06] text-ink-muted",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

function ActivityBadge({ type }: { type: AdminActivityItem["type"] }) {
  const label = type.replace("_", " ");
  const color =
    type === "meal"
      ? "bg-forest/10 text-forest"
      : type === "analysis"
        ? "bg-sage/10 text-sage-600"
        : type === "ai_usage"
          ? "bg-violet-50 text-violet-700"
          : "bg-sky-50 text-sky-700";

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${color}`}>{label}</span>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUsersResponse | null>(null);
  const [usage, setUsage] = useState<AdminUsageResponse | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, usersData, usageData, activityData] = await Promise.all([
        getAdminOverview(),
        listAdminUsers({ search, role: role || undefined, limit: 12 }),
        getAdminUsage(),
        getAdminActivity(18),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
      setUsage(usageData);
      setActivity(activityData.items);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError("Your account does not have admin access.");
      } else {
        setError(e instanceof Error ? e.message : "Couldn't load admin data.");
      }
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 150);
    return () => clearTimeout(timer);
  }, [load]);

  const expensiveModels = useMemo(() => usage?.byModel.slice(0, 5) ?? [], [usage]);

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[13px] text-ink-muted">Internal operations</p>
          <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
            Admin
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
            Monitor users, nutrition activity, AI spend, and API usage without touching the database.
          </p>
        </div>
        <div className="flex w-full rounded-full border border-ink/[0.08] bg-white/60 p-1 backdrop-blur-sm lg:w-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all lg:flex-none",
                tab === id ? "bg-forest text-cream shadow-[0_2px_8px_rgba(31,59,45,0.2)]" : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              <Icon size={14} weight={tab === id ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {loading && !overview ? <LoadingState /> : null}
      {error ? (
        <ErrorState
          title="Admin data unavailable"
          message={error}
          onRetry={load}
        />
      ) : null}

      {!loading && !error && overview && usage && users ? (
        <div className="space-y-8">
          {tab === "overview" ? (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Users" value={number.format(overview.users.total)} sub={`+${overview.users.newThisWeek} this week`} icon={Users} />
                <MetricCard label="Meals today" value={number.format(overview.meals.today)} sub={`${number.format(overview.meals.thisWeek)} meals this week`} icon={ForkKnife} />
                <MetricCard label="AI spend today" value={currency.format(overview.ai.costTodayUsd)} sub={`${number.format(overview.ai.requestsToday)} requests today`} icon={CurrencyDollar} />
                <MetricCard label="API health" value={number.format(overview.api.activeKeys)} sub={`${overview.api.failedCallsToday} failed calls today`} icon={Key} />
              </section>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-[20px] font-bold text-ink">AI Cost By Model</h2>
                    <Sparkle size={18} weight="duotone" className="text-sage-600" />
                  </div>
                  {expensiveModels.length === 0 ? (
                    <EmptyState title="No AI usage yet" message="Model cost will appear once users analyze meals or chat." />
                  ) : (
                    <div className="space-y-3">
                      {expensiveModels.map((model) => {
                        const pct = usage.summary.costUsd > 0 ? Math.min((model.costUsd / usage.summary.costUsd) * 100, 100) : 0;
                        return (
                          <div key={model.model}>
                            <div className="mb-1.5 flex items-center justify-between text-[13px]">
                              <span className="font-medium text-ink">{model.model}</span>
                              <span className="text-ink-muted">{currency.format(model.costUsd)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                              <div className="h-full rounded-full bg-sage" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <ActivityPanel items={activity.slice(0, 6)} />
              </section>
            </>
          ) : null}

          {tab === "users" ? (
            <section className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="font-display text-[20px] font-bold text-ink">Users</h2>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[13px] text-ink-muted">
                    <MagnifyingGlass size={14} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search email or name"
                      className="w-44 bg-transparent text-ink outline-none placeholder:text-ink-muted/60"
                    />
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole | "")}
                    className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[13px] font-medium text-ink outline-none"
                  >
                    <option value="">All roles</option>
                    <option value="USER">Users</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>
              <UsersTable users={users.items} />
            </section>
          ) : null}

          {tab === "usage" ? (
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <MetricCard label="AI requests" value={number.format(usage.summary.requests)} sub={`${usage.summary.cacheHitRate}% cache hit rate`} icon={Sparkle} />
                <MetricCard label="AI cost" value={currency.format(usage.summary.costUsd)} sub={`${number.format(usage.summary.totalTokens)} total tokens`} icon={CurrencyDollar} />
                <MetricCard label="Latency" value={`${usage.summary.avgLatencyMs}ms`} sub="average provider latency" icon={Clock} />
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm">
                <h2 className="mb-5 font-display text-[20px] font-bold text-ink">Usage Breakdown</h2>
                <Breakdown title="By Provider" rows={usage.byProvider.map((r) => ({ label: r.provider, value: r.requests, meta: currency.format(r.costUsd) }))} />
                <Breakdown title="By Endpoint" rows={usage.byEndpoint.map((r) => ({ label: r.endpoint, value: r.requests, meta: currency.format(r.costUsd) }))} />
              </div>
            </section>
          ) : null}

          {tab === "activity" ? <ActivityPanel items={activity} large /> : null}
        </div>
      ) : null}
    </div>
  );
}

function UsersTable({ users }: { users: AdminUserRow[] }) {
  if (users.length === 0) {
    return <EmptyState title="No users found" message="Try a different search or role filter." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-separate border-spacing-y-2 text-left">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            <th className="px-4 py-2 font-semibold">User</th>
            <th className="px-4 py-2 font-semibold">Role</th>
            <th className="px-4 py-2 font-semibold">Meals</th>
            <th className="px-4 py-2 font-semibold">AI Cost</th>
            <th className="px-4 py-2 font-semibold">API Keys</th>
            <th className="px-4 py-2 font-semibold">Last Meal</th>
            <th className="px-4 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="rounded-2xl bg-white/55 text-[13px] text-ink shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]">
              <td className="rounded-l-2xl px-4 py-3">
                <p className="font-semibold">{user.name ?? "Unnamed user"}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">{user.email}</p>
              </td>
              <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
              <td className="px-4 py-3">{number.format(user.counts.meals)}</td>
              <td className="px-4 py-3">{currency.format(user.ai.costUsd)}</td>
              <td className="px-4 py-3">{number.format(user.counts.apiKeys)}</td>
              <td className="px-4 py-3">{relDate(user.lastMealAt)}</td>
              <td className="rounded-r-2xl px-4 py-3">
                <span className={user.emailVerified ? "text-forest" : "text-amber-700"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<{ label: string; value: number; meta: string }> }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="mb-7 last:mb-0">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[13px] text-ink-muted">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink">{row.label}</span>
                <span className="text-ink-muted">{number.format(row.value)} · {row.meta}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                <div className="h-full rounded-full bg-forest" style={{ width: `${(row.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityPanel({ items, large = false }: { items: AdminActivityItem[]; large?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[20px] font-bold text-ink">Recent Activity</h2>
        <Database size={18} weight="duotone" className="text-sage-600" />
      </div>
      {items.length === 0 ? (
        <EmptyState title="No activity yet" message="Meals, analyses, API calls, and AI usage will appear here." />
      ) : (
        <div className={large ? "grid grid-cols-1 gap-3 xl:grid-cols-2" : "space-y-3"}>
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <ActivityBadge type={item.type} />
                <span className="text-[11px] text-ink-muted">{relDate(item.createdAt)}</span>
              </div>
              <p className="text-[14px] font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">{item.detail}</p>
              <p className="mt-2 text-[11px] text-ink-muted">
                {item.user ? item.user.email : "Anonymous/system"}
              </p>
            </div>
          ))}
        </div>
      )}
      {!large && items.length > 0 ? (
        <button type="button" className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-sage-600">
          <Warning size={13} weight="fill" />
          Review unusual spikes in usage first
        </button>
      ) : null}
    </div>
  );
}
