import { apiFetch } from "./client";

export interface UserPlan {
  tier: "FREE" | "PRO";
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "EXPIRED";
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
}

export interface CheckoutResponse {
  paymentLink: string;
  paymentId: string;
}

export function getMyPlan(options: { silent?: boolean } = {}): Promise<UserPlan> {
  return apiFetch<UserPlan>("/payments/plan", {
    silent: options.silent,
  });
}

export function createCheckout(plan: "monthly" | "lifetime", options: { silent?: boolean } = {}): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: { plan },
    silent: options.silent,
  });
}
