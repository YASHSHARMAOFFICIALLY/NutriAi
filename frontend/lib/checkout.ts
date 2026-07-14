import { cv, track } from "@hellyeah/x-ray";
import { UnauthorizedError } from "@/lib/api/client";
import { createCheckout } from "@/lib/api/payments";
import { withNextParam } from "@/lib/safeRedirect";
import type { PaidPlanId } from "@/lib/plans";

const CHECKOUT_ERROR = "Could not start checkout. Please try again.";

export interface StartCheckoutOptions {
  /**
   * Path to return to after login when the user is not authenticated. The plan
   * is appended as `?checkout=<planId>` so the destination can auto-resume.
   */
  onUnauthorizedRedirectTo: string;
}

export type StartCheckoutResult =
  | { status: "redirecting" }
  | { status: "error"; message: string };

/**
 * Consolidated checkout entry point for both the pricing page and the marketing
 * landing page. On success it navigates to the payment link; when the user is
 * signed out it sends them to login with a resume token; otherwise it returns an
 * error the caller can surface inline.
 */
export async function startCheckout(
  planId: PaidPlanId,
  { onUnauthorizedRedirectTo }: StartCheckoutOptions,
): Promise<StartCheckoutResult> {
  try {
    const { paymentLink } = await createCheckout(planId, { silent: true });
    if (paymentLink) {
      track(cv.beginCheckout, { plan: planId });
      window.location.href = paymentLink;
      return { status: "redirecting" };
    }
    return { status: "error", message: CHECKOUT_ERROR };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      const resumeTo = `${onUnauthorizedRedirectTo}${onUnauthorizedRedirectTo.includes("?") ? "&" : "?"}checkout=${planId}`;
      window.location.href = withNextParam("/login", resumeTo);
      return { status: "redirecting" };
    }
    return { status: "error", message: CHECKOUT_ERROR };
  }
}
