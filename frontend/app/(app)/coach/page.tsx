"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowClockwise, PaperPlaneTilt, Sparkle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { deleteConversation, getConversation, sendChatMessage } from "@/lib/api/chat";
import type { MealDTO } from "@/lib/api/types";
import { useConversations, useDailySummary, useMeals, useProfile, useRecommendations, useActiveChallenges } from "@/lib/hooks/swr";
import { useToast } from "@/lib/toast";
import { BudgetBar, MealLine, PageHeader, Panel, Skeleton } from "../_components/ui";
import type { Meal } from "../_components/ui";

type ChatMessage = { role: "user" | "assistant"; text: string };

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
  const { toast } = useToast();

  // --- SWR data fetching ---
  const { data: conversations = [], mutate: mutateConversations } = useConversations();
  const { data: daily } = useDailySummary();
  const { data: apiMeals } = useMeals();
  const { data: apiProfile } = useProfile();
  const { data: apiRecs } = useRecommendations({ limit: 1 });
  const { data: apiChallenges } = useActiveChallenges();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationStatus, setConversationStatus] = useState<"idle" | "loading">("idle");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);

  // --- Derive state from SWR data ---
  const totals = useMemo(() => daily
    ? { calories: Math.round(daily.totalCalories), protein: Math.round(daily.totalProtein), carbs: Math.round(daily.totalCarbs), fat: Math.round(daily.totalFat) }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 },
  [daily]);

  const meals = useMemo(() => apiMeals?.length ? apiMeals.map(mealFromApi) : [], [apiMeals]);

  const targets = useMemo(() => apiProfile
    ? { calories: apiProfile.effectiveCalorieTarget ?? apiProfile.dailyCalorieTarget ?? 0, protein: apiProfile.effectiveProteinTargetG ?? apiProfile.proteinTargetG ?? 0, carbs: apiProfile.effectiveCarbsTargetG ?? apiProfile.carbsTargetG ?? 0, fat: apiProfile.effectiveFatTargetG ?? apiProfile.fatTargetG ?? 0 }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 },
  [apiProfile]);

  const allergies = useMemo(() => apiProfile?.allergies ?? [], [apiProfile]);

  const topMeal = useMemo(() => {
    const first = apiRecs?.recommendations?.[0];
    return first ? first.items.map((item) => item.name).join(", ") : "";
  }, [apiRecs]);

  const activeChallenge = apiChallenges?.[0] ?? null;
  const contextStatus = daily !== undefined ? "ready" : "loading";

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

  // Auto-scroll to the newest message as the thread grows or the typing dots appear.
  useEffect(() => {
    const node = threadEndRef.current;
    if (!node) return;
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
  }, [messages, sending]);

  async function handleSend(prompt = input) {
    const message = prompt.trim();
    if (!message || sending) return;
    setSending(true);
    setSendError(null);
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
    } catch {
      // Surface failures as an inline error chip, never as a fake Cuckoo reply.
      setSendError(message);
    } finally {
      setSending(false);
    }
  }

  async function handleSelectConversation(id: string) {
    setConversationStatus("loading");
    setSendError(null);
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

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setSendError(null);
  }

  async function handleDeleteConversation(id: string) {
    try {
      await deleteConversation(id);
      await mutateConversations(conversations.filter((item) => item.id !== id), { revalidate: false });
      if (conversationId === id) startNewConversation();
    } catch {
      toast("error", "Could not delete conversation.");
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <PageHeader eyebrow="Coach Cuckoo" title="Chat with nutrition context" />
      {loadError ? (
        <Panel className="mb-5 p-4">
          <p className="text-[13px] font-semibold text-[var(--danger)]">Could not load coach context. Sign in and try again.</p>
        </Panel>
      ) : null}

      <section className="grid gap-5 xl:min-h-[720px] xl:grid-cols-[260px_1fr_360px]">
        <Panel className="hidden p-4 xl:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f8b8d]">Conversations</p>
            <button onClick={startNewConversation} className="rounded-md px-2 py-1 text-[11px] font-bold text-forest transition-colors hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40">New</button>
          </div>
          <div className="space-y-2">
            {conversations.length ? conversations.map((item) => (
              <div key={item.id} className={`rounded-md p-3 text-left text-[13px] font-semibold ${conversationId === item.id ? "bg-[#173c2b] text-white" : "bg-[#f8f8f3] text-[#5f675f]"}`}>
                <button onClick={() => handleSelectConversation(item.id)} className="block w-full text-left">
                  <span className="block truncate">{item.title || "Untitled chat"}</span>
                  <span className="mt-1 block text-[11px] opacity-70">{item.messageCount} messages</span>
                </button>
                <button onClick={() => handleDeleteConversation(item.id)} className="mt-2 text-[11px] font-bold opacity-70 transition-opacity hover:opacity-100">
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
              onChange={(event) => event.target.value ? handleSelectConversation(event.target.value) : startNewConversation()}
              aria-label="Select conversation"
              className="mb-4 rounded-xl border border-border bg-surface-alt px-4 py-3 text-[13px] font-bold outline-none transition-colors focus:border-teal xl:hidden"
            >
              <option value="">New conversation</option>
              {conversations.map((item) => (
                <option key={item.id} value={item.id}>{item.title || "Untitled chat"}</option>
              ))}
            </select>
          ) : null}

          <div
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-label="Coach conversation"
          >
            {conversationStatus === "loading" || contextStatus === "loading" ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-2/3" />
                <Skeleton className="ml-auto h-14 w-1/2" />
                <Skeleton className="h-20 w-3/4" />
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const user = message.role === "user";
                  return (
                    <div key={index} className={`flex ${user ? "justify-end" : "justify-start"}`}>
                      <p className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14px] leading-6 sm:max-w-[78%] sm:px-5 sm:py-3.5 ${user ? "bg-forest text-white shadow-sm" : "bg-surface-alt border border-border"}`}>
                        {message.text}
                      </p>
                    </div>
                  );
                })}
                {sending ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface-alt px-5 py-4" aria-label="Cuckoo is typing">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-2 w-2 animate-bounce rounded-full bg-muted/60 motion-reduce:animate-none"
                          style={{ animationDelay: `${dot * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                {sendError ? (
                  <div className="flex justify-start">
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                      <span className="flex items-center gap-2">
                        <WarningCircle size={16} weight="fill" />
                        Message failed to send.
                      </span>
                      <button
                        onClick={() => handleSend(sendError)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-3 py-1.5 text-[12px] font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      >
                        <ArrowClockwise size={13} weight="bold" />
                        Retry
                      </button>
                    </div>
                  </div>
                ) : null}
                {!messages.length && !sendError ? (
                  <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-6 text-center">
                    <p className="text-[14px] font-semibold text-forest">Start with today&apos;s plan.</p>
                    <p className="mt-2 text-[12px] text-muted">Ask about meals, targets, preferences, or what to eat next.</p>
                  </div>
                ) : null}
              </>
            )}
            <div ref={threadEndRef} />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {quickPrompts.map((prompt) => (
              <button key={prompt} onClick={() => handleSend(prompt)} disabled={sending || contextStatus === "loading"} className="min-h-10 shrink-0 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-muted transition-colors hover:border-teal/30 hover:bg-white hover:text-forest disabled:opacity-50">
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="mt-4 flex items-end gap-2 rounded-2xl border border-border bg-surface-alt p-2.5 transition-colors focus-within:border-teal/30 focus-within:ring-2 focus-within:ring-teal/10 sm:gap-3 sm:p-3"
          >
            <textarea
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1 text-[14px] outline-none"
              rows={1}
              placeholder="Ask Cuckoo... (Enter to send, Shift+Enter for a new line)"
              aria-label="Message Coach Cuckoo"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
            />
            <button disabled={sending || contextStatus === "loading" || !input.trim()} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest text-white transition-colors hover:bg-forest-soft active:scale-95 disabled:opacity-60 sm:h-9 sm:w-9">
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
