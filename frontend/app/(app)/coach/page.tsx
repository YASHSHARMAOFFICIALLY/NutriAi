"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PaperPlaneTilt, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { ChatMessage, type Message } from "./_components/ChatMessage";
import { NutritionContext } from "./_components/NutritionContext";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ria",
    text: "Hey! I've reviewed your intake so far today. You're at 1,240 kcal — solid start. You're 76g short on protein though. Want a quick fix for dinner?",
    timestamp: "3:30 PM",
  },
];

const SUGGESTIONS = [
  "What should I eat for dinner?",
  "Am I hitting my protein goals?",
  "How many calories do I have left?",
  "Give me a high-protein snack idea",
];

const RIA_REPLIES: Record<string, string> = {
  dinner:
    "For dinner I'd go with 5oz salmon fillet (280 kcal, 34g protein) + a side of roasted sweet potato. That closes your protein gap and keeps fat in range. Simple 20-min cook.",
  protein:
    "You've had 54g protein today against a 130g goal — so you're at 42%. A 5oz chicken breast or Greek yogurt bowl at dinner gets you close to target.",
  calories:
    "You've logged 1,240 kcal against your 1,800 kcal goal — 560 remaining. That's a healthy buffer for dinner without going over.",
  snack:
    "Best high-protein snacks right now: cottage cheese (28g/cup), hard-boiled eggs (12g each), or a protein shake with almond milk (~25g). All under 200 kcal.",
};

function getRiaReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("dinner") || lower.includes("eat")) return RIA_REPLIES.dinner;
  if (lower.includes("protein")) return RIA_REPLIES.protein;
  if (lower.includes("calorie") || lower.includes("left") || lower.includes("remaining"))
    return RIA_REPLIES.calories;
  if (lower.includes("snack")) return RIA_REPLIES.snack;
  return "Great question! Based on your intake today, you're on a solid track. Keep focusing on whole proteins and complex carbs — your body will thank you. Want me to suggest a specific meal?";
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const riaMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ria",
        text: getRiaReply(text),
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, riaMsg]);
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex min-h-screen gap-6 p-8 lg:p-12">
      {/* Chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sage/30 bg-sage/15">
            <Sparkle size={16} weight="fill" className="text-sage-600" />
          </div>
          <div>
            <h1 className="font-display text-[22px] font-bold text-ink">Coach Ria</h1>
            <p className="text-[12px] text-ink-muted">AI Nutritionist · always on</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4 pb-4">
          {messages.map((msg, i) => (
            <ChatMessage key={msg.id} message={msg} index={i} />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex items-center gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-sage/15">
                  <Sparkle size={12} weight="fill" className="text-sage-600" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ink-muted/40"
                      style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions (only when conversation is short) */}
          {messages.length <= 1 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
              className="mt-2 flex flex-wrap gap-2"
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-ink/[0.08] bg-white/60 px-4 py-2 text-[12px] font-medium text-ink-muted backdrop-blur-sm transition-colors hover:border-sage/40 hover:text-sage-600"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 pt-4">
          <div className="flex items-end gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-[0_4px_24px_rgba(31,59,45,0.08)] backdrop-blur-xl">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Ria anything about your nutrition…"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] text-ink placeholder-ink-muted/50 outline-none"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isTyping}
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                input.trim() && !isTyping
                  ? "bg-forest text-cream shadow-[0_2px_8px_rgba(31,59,45,0.25)] hover:opacity-90 active:scale-95"
                  : "bg-ink/[0.05] text-ink-muted/40 cursor-not-allowed",
              ].join(" ")}
            >
              <PaperPlaneTilt size={15} weight="fill" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-muted/50">
            Ria uses your logged meals for context. Not medical advice.
          </p>
        </div>
      </div>

      {/* Right context panel */}
      <div className="hidden xl:block">
        <NutritionContext />
      </div>
    </div>
  );
}
