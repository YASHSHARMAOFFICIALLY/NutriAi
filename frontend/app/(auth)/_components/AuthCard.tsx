"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-[400px]"
      >
        <Link href="/" className="mb-8 flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-sage/30 bg-sage/15">
            <Sparkle size={14} weight="fill" className="text-sage-600" />
          </span>
          NutriAI
        </Link>
        <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-[14px] leading-[1.55] text-ink-muted">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 text-center text-[13px] text-ink-muted">{footer}</div>}
      </motion.div>
    </div>
  );
}
