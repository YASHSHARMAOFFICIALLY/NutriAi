import { apiFetch } from "./client";
import { withQuery } from "./query";
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
  return apiFetch<{ challenges: ChallengePreset[] }>(
    withQuery("/challenges", filters ?? {}),
  ).then((r) => r.challenges);
}

export function listMyChallenge(status?: ChallengeStatus): Promise<UserChallengeDTO[]> {
  return apiFetch<{ challenges: UserChallengeDTO[] }>(withQuery("/challenges/me", { status })).then(
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
