"use client";

import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface Message {
  id: string;
  role: "user" | "ria";
  text: string;
  timestamp: string;
}

export function ChatMessage({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: index * 0.05 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-sage/15">
          <Sparkle size={12} weight="fill" className="text-sage-600" />
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={[
            "rounded-2xl px-4 py-3 text-[14px] leading-[1.65]",
            isUser
              ? "rounded-tr-sm bg-forest text-cream"
              : "rounded-tl-sm border border-white/70 bg-white/70 text-ink shadow-[0_2px_12px_rgba(31,59,45,0.06)] backdrop-blur-sm",
          ].join(" ")}
        >
          {message.text}
        </div>
        <span className="px-1 text-[10px] text-ink-muted/60">{message.timestamp}</span>
      </div>
    </motion.div>
  );
}
