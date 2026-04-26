"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LinkSimple, Trash, UserPlus, UsersThree, X } from "@phosphor-icons/react/dist/ssr";
import {
  acceptFamilyInvite,
  createFamilyInvite,
  getFamilyOverview,
  removeFamilyMember,
  revokeFamilyInvite,
} from "@/lib/api/family";
import type { FamilyInviteResponse, FamilyOverview } from "@/lib/api/types";
import { PageHeader, Panel, Skeleton, Stat } from "../_components/ui";

export default function FamilyPage() {
  const [overview, setOverview] = useState<FamilyOverview | null>(null);
  const [email, setEmail] = useState("");
  const [acceptToken, setAcceptToken] = useState("");
  const [latestInvite, setLatestInvite] = useState<FamilyInviteResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getFamilyOverview()
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setMessage("");
        setStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setMessage("Family sharing is unavailable right now.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const members = useMemo(() => {
    const all = overview?.families.flatMap((family) => family.members) ?? [];
    return Array.from(new Map(all.map((member) => [member.id, member])).values());
  }, [overview]);

  const pendingInvites = overview?.ownedFamily?.invites ?? [];
  const sharedWithMe = members.filter((member) => member.role !== "OWNER").length;

  async function handleInvite() {
    if (!email.trim()) return;
    setStatus("saving");
    setMessage("");
    try {
      const invite = await createFamilyInvite(email.trim());
      setLatestInvite(invite);
      setEmail("");
      await getFamilyOverview().then(setOverview);
      setMessage("Invite created. Share the invite code with your family member.");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Couldn't create the invite. Check the email or existing membership.");
    }
  }

  async function handleAccept() {
    if (!acceptToken.trim()) return;
    setStatus("saving");
    setMessage("");
    try {
      await acceptFamilyInvite(acceptToken.trim());
      setAcceptToken("");
      setLatestInvite(null);
      await getFamilyOverview().then(setOverview);
      setMessage("Invite accepted. Shared analytics are now available.");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Couldn't accept that invite. It may be expired or for a different email.");
    }
  }

  async function handleRemove(memberId: string) {
    setStatus("saving");
    setMessage("");
    try {
      await removeFamilyMember(memberId);
      await getFamilyOverview().then(setOverview);
      setMessage("Family member removed.");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Couldn't remove that member.");
    }
  }

  async function handleRevoke(inviteId: string) {
    setStatus("saving");
    setMessage("");
    try {
      await revokeFamilyInvite(inviteId);
      await getFamilyOverview().then(setOverview);
      setMessage("Invite canceled.");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Couldn't cancel that invite.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Family" title="Analytics sharing" />

      {status === "loading" ? (
        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </section>
      ) : (
        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <Stat label="Members" value={`${members.length}`} sub="Analytics-only access" />
          <Stat label="Pending invites" value={`${pendingInvites.length}`} sub="Owner-managed" />
          <Stat label="Shared views" value={`${sharedWithMe}`} sub="Visible in Analytics" />
        </section>
      )}

      {message ? (
        <div className={`mb-5 rounded-lg border p-4 text-[13px] font-semibold ${status === "error" ? "border-[#b7791f]/30 bg-[#fff8e7] text-[#8a5a10]" : "border-[#173c2b]/20 bg-[#eef5f2] text-[#173c2b]"}`}>
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-semibold">Family members</h2>
              <p className="mt-1 text-[13px] text-[#5f675f]">Members can view shared nutrition summaries, not raw meal notes or photos.</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef5f2] text-[#173c2b]">
              <UsersThree size={20} weight="bold" />
            </span>
          </div>

          <div className="space-y-3">
            {status === "loading" ? (
              <>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </>
            ) : members.map((member) => (
              <div key={member.id} className="flex flex-col gap-3 rounded-lg border border-black/8 bg-[#f8f8f3] p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{member.user.name || member.user.email}</p>
                  <p className="mt-1 text-[12px] text-[#5f675f]">{member.user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#5f675f]">{member.role.toLowerCase()}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5f2] px-3 py-1 text-[11px] font-bold text-[#173c2b]">
                    <Check size={12} weight="bold" />
                    Analytics
                  </span>
                  {member.role !== "OWNER" ? (
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={status === "saving"}
                      className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-3 py-1.5 text-[12px] font-bold text-[#b7791f] disabled:opacity-50"
                    >
                      <Trash size={13} weight="bold" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            {!members.length && status !== "loading" ? (
              <div className="rounded-lg border border-black/8 bg-[#f8f8f3] p-5 text-[13px] font-semibold text-[#5f675f]">
                No family members yet. Send an invite to start sharing analytics.
              </div>
            ) : null}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-semibold">Invite family</h2>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="family@example.com"
                className="min-w-0 flex-1 rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[14px] font-semibold outline-none"
              />
              <button
                onClick={handleInvite}
                disabled={status === "saving" || !email.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-[#173c2b] px-4 py-3 text-[13px] font-bold text-white disabled:opacity-50"
              >
                <UserPlus size={15} weight="bold" />
                Invite
              </button>
            </div>
            {latestInvite ? (
              <div className="mt-4 rounded-md border border-[#d7ff68] bg-[#f8f8f3] p-3">
                <p className="text-[12px] font-bold text-[#173c2b]">Invite code</p>
                <p className="mt-2 break-all font-mono text-[12px]">{latestInvite.token}</p>
                <p className="mt-2 text-[11px] font-semibold text-[#5f675f]">This code is shown once here. The recipient can paste it in Accept invite.</p>
              </div>
            ) : null}
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-semibold">Accept invite</h2>
            <div className="flex gap-2">
              <input
                value={acceptToken}
                onChange={(event) => setAcceptToken(event.target.value)}
                placeholder="Paste invite code"
                className="min-w-0 flex-1 rounded-md border border-black/10 bg-[#f8f8f3] px-4 py-3 text-[13px] font-semibold outline-none"
              />
              <button
                onClick={handleAccept}
                disabled={status === "saving" || !acceptToken.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-[#d7ff68] px-4 py-3 text-[13px] font-bold text-[#101510] disabled:opacity-50"
              >
                <LinkSimple size={15} weight="bold" />
                Join
              </button>
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-4 text-[22px] font-semibold">Pending invites</h2>
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between gap-3 rounded-md border border-black/8 bg-[#f8f8f3] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{invite.email}</p>
                    <p className="mt-1 text-[11px] text-[#5f675f]">Expires {new Date(invite.expiresAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    disabled={status === "saving"}
                    className="grid h-8 w-8 place-items-center rounded-md border border-black/10 bg-white text-[#b7791f] disabled:opacity-50"
                    aria-label="Cancel invite"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              ))}
              {!pendingInvites.length ? <p className="text-[12px] font-semibold text-[#5f675f]">No pending invites.</p> : null}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
