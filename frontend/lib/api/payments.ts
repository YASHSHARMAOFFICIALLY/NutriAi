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

export function getMyPlan(): Promise<UserPlan> {
  return apiFetch<UserPlan>("/payments/plan");
}

export function createCheckout(plan: "monthly" | "lifetime"): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: { plan },
  });
}
