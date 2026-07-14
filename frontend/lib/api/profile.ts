import { apiFetch } from "./client";
import type { ActivityLevel, DerivedTargets, Goal, Sex, UpdateProfileInput, UserProfile } from "./types";

export interface TargetsPreviewInput {
  sex?: Sex | null;
  birthYear?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
  goal?: Goal | null;
}

export function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/profile");
}

export function previewTargets(input: TargetsPreviewInput): Promise<DerivedTargets> {
  return apiFetch<{ derived: DerivedTargets }>("/profile/targets/preview", {
    method: "POST",
    body: input,
  }).then((res) => res.derived);
}

export function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  return apiFetch<UserProfile>("/profile", { method: "PUT", body: input });
}

export function deleteProfile(): Promise<void> {
  return apiFetch<void>("/profile", { method: "DELETE" });
}
