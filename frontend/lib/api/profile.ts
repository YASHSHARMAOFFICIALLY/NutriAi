import { apiFetch } from "./client";
import type { UpdateProfileInput, UserProfile } from "./types";

export function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/profile");
}

export function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  return apiFetch<UserProfile>("/profile", { method: "PUT", body: input });
}

export function deleteProfile(): Promise<void> {
  return apiFetch<void>("/profile", { method: "DELETE" });
}
