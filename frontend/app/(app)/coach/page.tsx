"use client";

import { useEffect, useMemo, useState } from "react";
import { PaperPlaneTilt, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { getStreak } from "@/lib/api/analytics";
import { listMyChallenge } from "@/lib/api/challenges";
import { deleteConversation, getConversation, listConversations, sendChatMessage } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/client";
import { getDailySummary, listMeals } from "@/lib/api/meals";
import { getProfile } from "@/lib/api/profile";
import { getMealRecommendations } from "@/lib/api/recommendations";
import type { ConversationSummary, MealDTO, UserChallengeDTO } from "@/lib/api/types";
import { BudgetBar, MealLine, PageHeader, Panel, Skeleton } from "../_components/ui";
import type { Meal } from "../_components/ui";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function mealFromApi(meal: MealDTO): Meal {
  return {
    id: meal.id,
    mealType: meal.mealType,
    title: meal.notes || meal.items[0]?.name || meal.mealType.toLowerCase(),
    loggedAt: new Date(meal.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    source: meal.foodQueryId ? "IMAGE" : "TEXT",
    provider: "db",
    cached: false,
    confidence: 1,
    totals: {
      calories: Math.round(meal.totalCalories),
      protein: Math.round(meal.totalProtein),
      carbs: Math.round(meal.totalCarbs),
      fat: Math.round(meal.totalFat),
    },
    items: meal.items.map((item) => ({
      name: item.name,
      quantity: item.quantity ?? "",
      calories: Math.round(item.calories),
      protein: Math.round(item.protein),
      carbs: Math.round(item.carbs),
      fat: Math.round(item.fat),
      confidence: 1,
    })),
  };
}

export default function CoachPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [targets, setTargets] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [topMeal, setTopMeal] = useState("");
  const [activeChallenge, setActiveChallenge] = useState<UserChallengeDTO | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [contextStatus, setContextStatus] = useState<"loading" | "ready" | "error">("loading");
  const [conversationStatus, setConversationStatus] = useState<"idle" | "loading">("idle");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listConversations().catch(() => []),
      getDailySummary(todayISO()).catch(() => null),
      listMeals(todayISO()).catch(() => []),
      getProfile().catch(() => null),
      getMealRecommendations({ limit: 1 }).catch(() => ({ remaining: { calories: null, protein: null, carbs: null, fat: null }, recommendations: [] })),
      listMyChallenge("ACTIVE").catch(() => []),
      getStreak().catch(() => null),
    ])
      .then(([apiConversations, daily, apiMeals, apiProfile, apiRecs, apiChallenges]) => {
        if (cancelled) return;
        setConversations(apiConversations);
        if (daily) {
          setTotals({
            calories: Math.round(daily.totalCalories),
            protein: Math.round(daily.totalProtein),
            carbs: Math.round(daily.totalCarbs),
            fat: Math.round(daily.totalFat),
          });
        }
        if (apiMeals.length) setMeals(apiMeals.map(mealFromApi));
        if (apiProfile) {
          setTargets({
            calories: apiProfile.dailyCalorieTarget ?? 0,
            protein: apiProfile.proteinTargetG ?? 0,
            carbs: apiProfile.carbsTargetG ?? 0,
            fat: apiProfile.fatTargetG ?? 0,
          });
          setAllergies(apiProfile.allergies ?? []);
        }
        if (apiRecs.recommendations[0]) setTopMeal(apiRecs.recommendations[0].items.map((item) => item.name).join(", "));
        setActiveChallenge(apiChallenges[0] ?? null);
        setLoadError(false);
        setContextStatus("ready");
      })
      .catch(() => {
        setLoadError(true);
        setContextStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveRemaining = useMemo(() => ({
    calories: Math.max(0, targets.calories - totals.calories),
    protein: Math.max(0, targets.protein - totals.protein),
  }), [targets, totals]);
  const hasTargets = targets.calories > 0 || targets.protein > 0;
  const chatTitle = hasTargets ? `Today with ${liveRemaining.calories} kcal left` : "Today's nutrition coach";
  const quickPrompts = [
    hasTargets ? `What fits ${liveRemaining.calories} kcal?` : "Plan my next balanced meal",
    targets.protein > 0 ? `Close ${liveRemaining.protein}g protein` : "How can I add more protein?",
    allergies[0] ? `Avoid ${allergies[0]}` : "Use my saved preferences",
  ];

  async function handleSend(prompt = input) {
    const message = prompt.trim();
    if (!message || sending) return;
    setSending(true);
    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    try {
      const response = await sendChatMessage({
        message,
        conversationId,
        title: `Dinner with ${liveRemaining.calories} kcal left`,
      });
      setConversationId(response.conversationId);
      setMessages((current) => [...current, { role: "assistant", text: response.reply }]);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "I could not send that message right now. Sign in and try again.";
      setMessages((current) => [...current, { role: "assistant", text: errorMessage }]);
    } finally {
      setSending(false);
    }
  }

  async function handleSelectConversation(id: string) {
    setConversationStatus("loading");
    try {
      const conversation = await getConversation(id);
      setConversationId(conversation.id);
      setMessages(conversation.messages.map((item) => ({
        role: item.role === "USER" ? "user" : "assistant",
        text: item.content,
      })));
    } catch {
      setLoadError(true);
    } finally {
      setConversationStatus("idle");
    }
  }

  async function handleDeleteConversation(id: string) {
    try {
      await deleteConversation(id);
      setConversations((current) => current.filter((item) => item.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
      }
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <PageHeader eyebrow="Coach Cuckoo" title="Chat with nutrition context" />
      {loadError ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[#b7791f]">Could not load coach context. Sign in and try again.</p>
        </Panel>
      ) : null}

      <section className="grid gap-5 xl:min-h-[720px] xl:grid-cols-[260px_1fr_360px]">
        <Panel className="hidden p-4 xl:block">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">Conversations</p>
          <div className="space-y-2">
            {conversations.length ? conversations.map((item, index) => (
              <div key={item.id} className={`rounded-md p-3 text-left text-[13px] font-semibold ${conversationId === item.id || (!conversationId && index === 0) ? "bg-[#173c2b] text-white" : "bg-[#f8f8f3] text-[#5f675f]"}`}>
                <button onClick={() => handleSelectConversation(item.id)} className="block w-full text-left">
                  <span className="block truncate">{item.title || "Untitled chat"}</span>
                  <span className="mt-1 block text-[11px] opacity-70">{item.messageCount} messages</span>
                </button>
                <button onClick={() => handleDeleteConversation(item.id)} className="mt-2 text-[11px] font-bold opacity-70">
                  Delete
                </button>
              </div>
            )) : <p className="rounded-md bg-[#f8f8f3] p-3 text-[13px] font-semibold text-[#5f675f]">No conversations yet.</p>}
          </div>
        </Panel>

        <Panel className="flex min-h-[calc(100dvh-15rem)] flex-col p-4 sm:p-5 xl:min-h-0">
          <div className="mb-5 flex items-start gap-3 border-b border-border pb-4 sm:items-center">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime shadow-sm">
              <Sparkle size={20} weight="fill" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold">{chatTitle}</h2>
              <p className="text-[12px] text-[#5f675f]">{hasTargets ? "Uses your meals, targets, preferences, and active challenge." : "Add targets in settings for sharper meal guidance."}</p>
            </div>
          </div>

          {conversations.length ? (
            <select
              value={conversationId ?? ""}
              onChange={(event) => event.target.value ? handleSelectConversation(event.target.value) : undefined}
              className="mb-4 rounded-xl border border-border bg-surface-alt px-4 py-3 text-[13px] font-bold outline-none xl:hidden"
            >
              <option value="">New conversation</option>
              {conversations.map((item) => (
                <option key={item.id} value={item.id}>{item.title || "Untitled chat"}</option>
              ))}
            </select>
          ) : null}

          <div className="flex flex-1 flex-col gap-4">
            {conversationStatus === "loading" || contextStatus === "loading" ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-2/3" />
                <Skeleton className="ml-auto h-14 w-1/2" />
                <Skeleton className="h-20 w-3/4" />
              </div>
            ) : messages.map((message, index) => {
              const user = message.role === "user";
              return (
                <div key={index} className={`flex ${user ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[90%] rounded-2xl px-4 py-3 text-[14px] leading-6 sm:max-w-[78%] sm:px-5 sm:py-3.5 ${user ? "bg-forest text-white shadow-sm" : "bg-surface-alt border border-border"}`}>
                    {message.text}
                  </p>
                </div>
              );
            })}
            {sending ? (
              <div className="flex justify-start">
                <p className="max-w-[90%] rounded-2xl border border-border bg-surface-alt px-4 py-3 text-[14px] font-semibold leading-6 text-muted sm:max-w-[78%] sm:px-5 sm:py-3.5">
                  Preparing reply...
                </p>
              </div>
            ) : null}
            {contextStatus !== "loading" && !messages.length ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-6 text-center">
                <p className="text-[14px] font-semibold text-forest">Start with today&apos;s plan.</p>
                <p className="mt-2 text-[12px] text-muted">Ask about meals, targets, preferences, or what to eat next.</p>
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {quickPrompts.map((prompt) => (
              <button key={prompt} onClick={() => handleSend(prompt)} disabled={sending || contextStatus === "loading"} className="min-h-10 shrink-0 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-muted transition-all hover:border-teal/30 hover:bg-white hover:text-forest disabled:opacity-50">
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="mt-4 flex items-end gap-2 rounded-2xl border border-border bg-surface-alt p-2.5 transition-all focus-within:border-teal/30 focus-within:ring-2 focus-within:ring-teal/10 sm:gap-3 sm:p-3"
          >
            <textarea className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1 text-[14px] outline-none" rows={1} placeholder="Ask Cuckoo..." value={input} onChange={(event) => setInput(event.target.value)} />
            <button disabled={sending || contextStatus === "loading" || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest text-white transition-all hover:bg-forest-soft active:scale-95 disabled:opacity-60 sm:h-9 sm:w-9">
              <PaperPlaneTilt size={16} weight="fill" />
            </button>
          </form>
        </Panel>

        <aside className="space-y-5">
          <Panel className="p-5">
            <h2 className="mb-4 text-[20px] font-semibold">Live nutrition context</h2>
            <div className="space-y-4">
              <BudgetBar label="Calories" value={totals.calories} target={targets.calories} unit="" />
              <BudgetBar label="Protein" value={totals.protein} target={targets.protein} unit="g" tone="teal" />
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-3 text-[20px] font-semibold">Top repeat meal</h2>
            <p className="text-[15px] font-semibold">{topMeal || "No repeat meal yet"}</p>
            <p className="mt-2 text-[13px] leading-6 text-[#5f675f]">Your saved meals help this panel suggest familiar options.</p>
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-3 text-[20px] font-semibold">Recent meals</h2>
            <div className="space-y-2">
              {meals.slice(0, 2).map((meal) => <MealLine key={meal.id} meal={meal} />)}
              {!meals.length ? <p className="text-[13px] font-semibold text-[#5f675f]">No meals logged today.</p> : null}
            </div>
          </Panel>
          <Panel className="p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">Active challenge</p>
            <p className="mt-2 text-[18px] font-semibold">{activeChallenge?.title ?? "No active challenge"}</p>
            <p className="mt-1 text-[13px] text-[#5f675f]">{activeChallenge ? `${activeChallenge.daysCheckedIn}/${activeChallenge.durationDays} days checked in` : "Start a challenge to add context."}</p>
          </Panel>
        </aside>
      </section>
    </div>
  );
}
