import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowClockwise,
  LockKey,
  Plus,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

type Action =
  | { label: string; onClick: () => void; href?: never }
  | { label: string; href: string; onClick?: never };

interface AppStateProps {
  title: string;
  message?: string;
  action?: Action;
  icon?: ReactNode;
  tone?: "neutral" | "warning" | "privacy";
  className?: string;
}

const toneStyles = {
  neutral: {
    icon: "border-sage/20 bg-sage/10 text-sage-600",
    border: "border-white/70",
  },
  warning: {
    icon: "border-amber-200 bg-amber-50 text-amber-700",
    border: "border-amber-200/70",
  },
  privacy: {
    icon: "border-forest/20 bg-forest/10 text-forest",
    border: "border-forest/15",
  },
} as const;

function ActionButton({ action }: { action: Action }) {
  const classes =
    "mt-4 inline-flex items-center justify-center rounded-full bg-forest px-4 py-2 text-[12px] font-semibold text-cream transition hover:brightness-110 active:scale-[0.99]";

  if (action.href !== undefined) {
    return (
      <Link href={action.href} className={classes}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={classes}>
      {action.label}
    </button>
  );
}

export function LoadingState({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/70 bg-white/60 p-6 backdrop-blur-sm ${className}`}>
      <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-ink/[0.06]" />
      <div className="space-y-3">
        <div className="h-12 animate-pulse rounded-2xl bg-ink/[0.05]" />
        <div className="h-12 animate-pulse rounded-2xl bg-ink/[0.04]" />
        <div className="h-12 animate-pulse rounded-2xl bg-ink/[0.03]" />
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <AppState
      title={title}
      message={message}
      tone="warning"
      icon={<Warning size={18} weight="fill" />}
      action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
      className={className}
    />
  );
}

export function EmptyState({
  title,
  message,
  action,
  className,
}: Pick<AppStateProps, "title" | "message" | "action" | "className">) {
  return (
    <AppState
      title={title}
      message={message}
      icon={<Plus size={18} weight="bold" />}
      action={action}
      className={className}
    />
  );
}

export function PrivacyNotice({
  title,
  message,
  className,
}: Pick<AppStateProps, "title" | "message" | "className">) {
  return (
    <AppState
      title={title}
      message={message}
      tone="privacy"
      icon={<LockKey size={18} weight="fill" />}
      className={className}
    />
  );
}

export function InlineNotice({
  title,
  message,
  onRetry,
  tone = "warning",
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
  tone?: "warning" | "neutral";
}) {
  const styles = toneStyles[tone];

  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl border ${styles.border} bg-white/60 px-5 py-4 text-[13px] backdrop-blur-sm`}>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {message ? <p className="mt-0.5 text-ink-muted">{message}</p> : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1 text-[12px] font-medium text-ink-muted transition-colors hover:border-sage/40 hover:text-sage-600"
        >
          <ArrowClockwise size={12} weight="bold" />
          Retry
        </button>
      ) : null}
    </div>
  );
}

function AppState({
  title,
  message,
  action,
  icon,
  tone = "neutral",
  className = "",
}: AppStateProps) {
  const styles = toneStyles[tone];

  return (
    <div className={`rounded-3xl border ${styles.border} bg-white/60 p-6 text-center backdrop-blur-sm ${className}`}>
      <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border ${styles.icon}`}>
        {icon}
      </div>
      <p className="mt-4 font-display text-[18px] font-bold text-ink">{title}</p>
      {message ? <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">{message}</p> : null}
      {action ? <ActionButton action={action} /> : null}
    </div>
  );
}
