"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PaperPlaneTilt, Sparkle, Warning } from "@phosphor-icons/react/dist/ssr";
import { ChatMessage, type Message } from "./_components/ChatMessage";
import { NutritionContext } from "./_components/NutritionContext";
import { sendChatMessage } from "@/lib/api/chat";
import type { ChatMessageDTO } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SUGGESTIONS = [
  "What should I eat for dinner?",
  "Am I hitting my protein goals?",
  "How many calories do I have left?",
  "Give me a high-protein snack idea",
];

function toMessage(dto: ChatMessageDTO): Message {
  return {
    id: dto.id,
    role: dto.role === "USER" ? "user" : "ria",
    text: dto.content,
    timestamp: new Date(dto.createdAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setError(null);

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setIsTyping(true);

    try {
      const resp = await sendChatMessage({ message: trimmed, conversationId });
      setConversationId(resp.id);
      setMessages(resp.messages.map(toMessage));
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(
        e instanceof ApiError
          ? e.message
          : "Couldn't reach Ria. Check your connection and try again."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const showEmptyState = messages.length === 0 && !isTyping;

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
          {showEmptyState && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/60 px-5 py-6 backdrop-blur-sm"
            >
              <p className="text-[15px] font-semibold text-ink">
                Hey! I&apos;m Ria — your AI nutritionist.
              </p>
              <p className="text-[13px] leading-relaxed text-ink-muted">
                Ask me anything about your meals, targets, or what to eat next.
                I&apos;ll factor in everything you&apos;ve logged.
              </p>
            </motion.div>
          )}

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

          {/* Suggestions (only when no messages yet) */}
          {showEmptyState && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
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

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
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
