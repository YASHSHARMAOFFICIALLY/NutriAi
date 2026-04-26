import { apiFetch } from "./client";
import type {
  ChallengeCategory,
  ChallengePreset,
  ChallengeStatus,
  StartChallengeInput,
  UserChallengeDTO,
} from "./types";

export function listPresets(filters?: {
  category?: ChallengeCategory;
  durationDays?: number;
}): Promise<ChallengePreset[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.durationDays) params.set("durationDays", String(filters.durationDays));
  const qs = params.toString();
  return apiFetch<{ challenges: ChallengePreset[] }>(
    `/challenges${qs ? `?${qs}` : ""}`,
  ).then((r) => r.challenges);
}

export function listMyChallenge(status?: ChallengeStatus): Promise<UserChallengeDTO[]> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<{ challenges: UserChallengeDTO[] }>(`/challenges/me${qs}`).then(
    (r) => r.challenges,
  );
}

export function startChallenge(input: StartChallengeInput): Promise<UserChallengeDTO> {
  return apiFetch<{ challenge: UserChallengeDTO }>("/challenges/me", {
    method: "POST",
    body: input,
  }).then((r) => r.challenge);
}

export function checkInToday(userChallengeId: string): Promise<UserChallengeDTO> {
  return apiFetch<{ challenge: UserChallengeDTO }>(
    `/challenges/me/${userChallengeId}/check-in`,
    { method: "POST" },
  ).then((r) => r.challenge);
}

export function abandonChallenge(userChallengeId: string): Promise<UserChallengeDTO> {
  return apiFetch<{ challenge: UserChallengeDTO }>(
    `/challenges/me/${userChallengeId}`,
    { method: "DELETE" },
  ).then((r) => r.challenge);
}
