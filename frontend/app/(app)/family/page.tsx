"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Flame,
  Trash,
  Check,
  X,
  CaretDown,
  CaretUp,
  ForkKnife,
} from "@phosphor-icons/react/dist/ssr";
import {
  acceptFamilyInvite,
  getSharedDailySummary,
  getSharedMeals,
  getSharedStreak,
  inviteFamily,
  listOutgoingShares,
  listPendingInvites,
  listViewable,
  revokeFamilyShare,
  type FamilyOutgoingShare,
  type FamilyPendingShare,
  type FamilyShare,
  type FamilyUserMini,
} from "@/lib/api/family";
import type { DailySummary, MealDTO } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const todayISO = () => new Date().toISOString().slice(0, 10);
const initials = (u: FamilyUserMini) =>
  (u.name ?? u.email).trim().slice(0, 2).toUpperCase();

export default function FamilyPage() {
  const [viewable, setViewable] = useState<FamilyShare[]>([]);
  const [pending, setPending] = useState<FamilyPendingShare[]>([]);
  const [outgoing, setOutgoing] = useState<FamilyOutgoingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [v, p, o] = await Promise.all([
        listViewable(),
        listPendingInvites(),
        listOutgoingShares(),
      ]);
      setViewable(v);
      setPending(p);
      setOutgoing(o);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleAccept = async (shareId: string) => {
    await acceptFamilyInvite(shareId);
    await refresh();
  };

  const handleRevoke = async (shareId: string) => {
    await revokeFamilyShare(shareId);
    await refresh();
  };

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <p className="text-[13px] text-ink-muted">Family sharing</p>
          <h1 className="mt-1 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
            Family
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-muted">
            Watch over loved ones. Invite family members to share a view-only look
            at their meals and streak — no edits, no surprises.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-forest px-5 py-2.5 text-[13px] font-semibold text-cream shadow-[0_4px_20px_rgba(31,59,45,0.25)] transition hover:opacity-90 active:scale-[0.99]"
        >
          <UserPlus size={16} weight="bold" />
          Invite family
        </button>
      </header>

      <div className="flex max-w-4xl flex-col gap-10">

        {/* Pending invites I received */}
        {pending.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <h2 className="mb-4 font-display text-[18px] font-semibold text-ink">
              Invites for you
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((p) => (
                <div
                  key={p.shareId}
                  className="flex items-center justify-between rounded-2xl border border-sage/30 bg-sage/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar user={p.owner} />
                    <div>
                      <p className="text-[14px] font-semibold text-ink">
                        {p.owner.name ?? p.owner.email}
                      </p>
                      <p className="text-[12px] text-ink-muted">
                        wants to share their nutrition with you
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(p.shareId)}
                      className="flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-[12px] font-semibold text-cream transition hover:opacity-90"
                    >
                      <Check size={14} weight="bold" /> Accept
                    </button>
                    <button
                      onClick={() => handleRevoke(p.shareId)}
                      className="flex items-center gap-1.5 rounded-xl border border-ink/10 px-4 py-2 text-[12px] font-medium text-ink-muted transition hover:bg-ink/5"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* People I can view */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        >
          <h2 className="mb-4 font-display text-[18px] font-semibold text-ink">
            People you can view {viewable.length > 0 && <span className="text-ink-muted">· {viewable.length}</span>}
          </h2>
          {loading && viewable.length === 0 ? (
            <p className="text-[14px] text-ink-muted">Loading…</p>
          ) : viewable.length === 0 ? (
            <EmptyState text="No one is sharing their data with you yet. Ask them to invite you from their family page." />
          ) : (
            <div className="flex flex-col gap-3">
              {viewable.map((s) => (
                <ViewableCard
                  key={s.shareId}
                  share={s}
                  onRevoke={() => handleRevoke(s.shareId)}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* People I've invited */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        >
          <h2 className="mb-4 font-display text-[18px] font-semibold text-ink">
            People who can view you
          </h2>
          {outgoing.length === 0 ? (
            <EmptyState text="You haven't shared your data with anyone. Click 'Invite family' to get started." />
          ) : (
            <div className="flex flex-col gap-3">
              {outgoing.map((o) => (
                <div
                  key={o.shareId}
                  className="flex items-center justify-between rounded-2xl border border-ink/[0.08] bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar user={o.viewer} />
                    <div>
                      <p className="text-[14px] font-semibold text-ink">
                        {o.viewer.name ?? o.invitedEmail}
                      </p>
                      <p className="text-[12px] text-ink-muted">
                        {o.status === "ACCEPTED"
                          ? "Can view your data"
                          : "Waiting for them to accept"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(o.shareId)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-[12px] font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <Trash size={13} />
                    {o.status === "ACCEPTED" ? "Revoke" : "Cancel"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <InviteModal
            onClose={() => setModalOpen(false)}
            onSent={async () => {
              setModalOpen(false);
              await refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Avatar({ user }: { user: FamilyUserMini }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/20 text-[13px] font-semibold text-forest">
      {initials(user)}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/10 bg-cream/40 p-8 text-center">
      <p className="text-[14px] text-ink-muted">{text}</p>
    </div>
  );
}

function ViewableCard({
  share,
  onRevoke,
}: {
  share: FamilyShare;
  onRevoke: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [meals, setMeals] = useState<MealDTO[] | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!expanded && summary === null) {
      setLoading(true);
      try {
        const date = todayISO();
        const [s, m, st] = await Promise.all([
          getSharedDailySummary(share.owner.id, date),
          getSharedMeals(share.owner.id, date),
          getSharedStreak(share.owner.id),
        ]);
        setSummary(s);
        setMeals(m.meals);
        setStreak(st.loggingStreak ?? 0);
      } catch {}
      setLoading(false);
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-white">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between p-4 text-left transition hover:bg-cream/40"
      >
        <div className="flex items-center gap-3">
          <Avatar user={share.owner} />
          <div>
            <p className="text-[14px] font-semibold text-ink">
              {share.owner.name ?? share.owner.email}
            </p>
            <p className="text-[12px] text-ink-muted">
              Tap to {expanded ? "hide" : "view"} today's meals
            </p>
          </div>
        </div>
        {expanded ? (
          <CaretUp size={18} className="text-ink-muted" />
        ) : (
          <CaretDown size={18} className="text-ink-muted" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-ink/[0.06] bg-cream/30 p-5"
        >
          {loading ? (
            <p className="text-[13px] text-ink-muted">Loading…</p>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap gap-4">
                <Stat label="Calories today" value={Math.round(summary?.totalCalories ?? 0)} />
                <Stat label="Meals" value={summary?.mealCount ?? 0} />
                <Stat
                  label="Streak"
                  value={
                    <span className="flex items-center gap-1">
                      <Flame size={14} weight="fill" className="text-amber-500" />
                      {streak ?? 0}
                    </span>
                  }
                />
              </div>

              {meals && meals.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {meals.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-xl bg-white p-3 text-[13px]"
                    >
                      <div className="flex items-center gap-3">
                        <ForkKnife size={14} className="text-sage" />
                        <span className="font-medium text-ink">
                          {m.items[0]?.name ?? m.mealType.toLowerCase()}
                        </span>
                        <span className="text-ink-muted">· {m.mealType.toLowerCase()}</span>
                      </div>
                      <span className="font-semibold text-ink">
                        {Math.round(m.totalCalories)} kcal
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-ink-muted">
                  No meals logged today.
                </p>
              )}

              <div className="mt-5 border-t border-ink/[0.06] pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevoke();
                  }}
                  className="text-[12px] text-red-500 transition hover:text-red-600"
                >
                  Remove access
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-[100px] rounded-xl bg-white p-3">
      <p className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-[18px] font-bold text-ink">{value}</p>
    </div>
  );
}

function InviteModal({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    setError("");
    try {
      await inviteFamily(email.trim());
      await onSent();
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof ApiError ? e.message : "Couldn't send invite. Try again.",
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-cream p-7 shadow-2xl"
      >
        <h2 className="font-display text-[22px] font-bold text-ink">
          Invite a family member
        </h2>
        <p className="mt-2 text-[13px] text-ink-muted">
          They'll get an email asking to accept. They can only <strong>view</strong>{" "}
          your meals — never edit or delete.
        </p>
        <div className="mt-5">
          <label className="block text-[12px] font-medium text-ink-muted">
            Email
          </label>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mummy@example.com"
            className="mt-1.5 w-full rounded-xl border border-ink/[0.08] bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-sage/60 focus:ring-2 focus:ring-sage/10"
          />
          {status === "error" && (
            <p className="mt-2 text-[12px] text-red-500">{error}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-ink-muted transition hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={status === "sending" || !email.trim()}
            className="rounded-xl bg-forest px-5 py-2 text-[13px] font-semibold text-cream transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send invite"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
