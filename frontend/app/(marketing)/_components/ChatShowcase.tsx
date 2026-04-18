"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "../_primitives/Container";
import { Reveal } from "../_primitives/Reveal";
import { revealTransition } from "../_lib/motion";

const TRANSCRIPT = [
  { role: "user", text: "2 boiled eggs and a slice of whole-wheat toast" },
  {
    role: "assistant",
    text: "≈ 235 kcal · 16g protein · 18g carbs · 11g fat. That puts you at 1,420 / 2,100 kcal for today.",
  },
  { role: "user", text: "add peanut butter on the toast" },
  {
    role: "assistant",
    text: "Updated to ≈ 330 kcal · 20g protein · 20g carbs · 19g fat. Logged to breakfast.",
  },
] as const;

export function ChatShowcase() {
  const prefersReduced = useReducedMotion();
  const messageHidden = prefersReduced ? {} : { opacity: 0, y: 16, filter: "blur(8px)" };
  const messageShow = prefersReduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <section className="relative py-28 md:py-36">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-sage-600">
              Chat
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-5xl">
              Talk to your <span className="italic text-forest">food log.</span>
            </h2>
            <p className="mt-5 max-w-[460px] text-[17px] leading-[1.5] text-ink-muted">
              The assistant reads your recent meals, targets, and streak before every reply — so answers are grounded in what you actually ate, not generic advice.
            </p>
            <ul className="mt-7 flex flex-col gap-3 text-[15px] text-ink">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sage" />
                Conversation history is persisted and searchable.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sage" />
                Every answer runs through a cached, metered AI layer — 24h dedupe by input hash.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sage" />
                Swap providers (OpenAI, stub, your own) without touching the client.
              </li>
            </ul>
          </Reveal>

          <div className="relative mx-auto w-full max-w-[400px]">
              {/* Phone frame */}
              <div className="relative aspect-[9/18] overflow-hidden rounded-[44px] border-[10px] border-ink bg-cream shadow-[0_40px_80px_rgba(31,59,45,0.22)]">
                <div className="absolute left-1/2 top-0 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink" />
                <div className="flex h-full flex-col gap-3 overflow-hidden p-5 pt-10">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-display text-[13px] font-bold tracking-tight text-ink">
                      NutriAI
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-sage-600">
                      · live
                    </span>
                  </div>
                  <motion.div
                    className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden"
                    initial={prefersReduced ? false : "hidden"}
                    whileInView={prefersReduced ? undefined : "show"}
                    viewport={{ once: false, amount: 0.7 }}
                    variants={{
                      hidden: {},
                      show: {
                        transition: {
                          staggerChildren: 0.32,
                          delayChildren: 0.28,
                        },
                      },
                    }}
                  >
                    {TRANSCRIPT.map((msg, i) => (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: messageHidden,
                          show: { ...messageShow, transition: revealTransition },
                        }}
                        className={
                          msg.role === "user"
                            ? "ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-forest px-3.5 py-2.5 text-[12.5px] leading-snug text-cream shadow-sm"
                            : "mr-auto max-w-[88%] rounded-2xl rounded-tl-sm border border-white/70 bg-white/90 px-3.5 py-2.5 text-[12.5px] leading-snug text-ink shadow-sm"
                        }
                      >
                        {msg.text}
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                    whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.9 }}
                    transition={{
                      ...revealTransition,
                      delay: 1.52,
                    }}
                    className="mt-2 flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                  >
                    <span className="flex-1 text-[12px] text-ink-muted">Ask about today&rsquo;s macros…</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-cream">
                      <PaperPlaneTilt size={13} weight="fill" />
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
        </div>
      </Container>
    </section>
  );
}
