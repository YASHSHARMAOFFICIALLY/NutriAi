"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiUrl } from "@/lib/api/config";

const VISITOR_KEY = "nutriai_visitor_id";
const VISIT_DEDUPE_MS = 5 * 60 * 1000;

function getVisitorId(): string {
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const next =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(VISITOR_KEY, next);
  return next;
}

export function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const path = `${pathname}${window.location.search}`;
    const lastVisitKey = `nutriai_last_visit:${path}`;
    const lastVisitAt = Number(window.sessionStorage.getItem(lastVisitKey) ?? 0);
    if (Date.now() - lastVisitAt < VISIT_DEDUPE_MS) return;
    window.sessionStorage.setItem(lastVisitKey, String(Date.now()));

    const body = JSON.stringify({
      visitorId: getVisitorId(),
      path,
      referrer: document.referrer || null,
    });

    const url = apiUrl("/public/visit");
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.(url, blob)) return;

    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
