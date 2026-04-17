import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';
import type { ActivityLevel, Goal, Prisma, Sex, UserProfile } from '@prisma/client';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

const GOAL_CALORIE_DELTA: Record<Goal, number> = {
  LOSE: -500,
  MAINTAIN: 0,
  GAIN: 300,
};

interface TargetInputs {
  sex?: Sex | null;
  birthYear?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
  goal?: Goal | null;
}

export interface DerivedTargets {
  bmr: number | null;
  tdee: number | null;
  dailyCalorieTarget: number | null;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
}

// Mifflin-St Jeor BMR, then apply activity multiplier and goal delta. All
// fields must be present to produce a number; otherwise we return null so
// callers can fall back to the persisted manual override.
export const deriveTargets = (p: TargetInputs, now = new Date()): DerivedTargets => {
  const { sex, birthYear, heightCm, weightKg, activityLevel, goal } = p;

  if (!sex || !birthYear || !heightCm || !weightKg || !activityLevel || !goal) {
    return {
      bmr: null,
      tdee: null,
      dailyCalorieTarget: null,
      proteinTargetG: null,
      carbsTargetG: null,
      fatTargetG: null,
    };
  }

  const age = now.getUTCFullYear() - birthYear;
  const sexOffset = sex === 'MALE' ? 5 : sex === 'FEMALE' ? -161 : -78;
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
  const dailyCalorieTarget = Math.max(1200, tdee + GOAL_CALORIE_DELTA[goal]);

  // 30/40/30 default macro split (protein/carbs/fat). 4/4/9 kcal per gram.
  const proteinTargetG = Math.round((dailyCalorieTarget * 0.3) / 4);
  const carbsTargetG = Math.round((dailyCalorieTarget * 0.4) / 4);
  const fatTargetG = Math.round((dailyCalorieTarget * 0.3) / 9);

  return { bmr, tdee, dailyCalorieTarget, proteinTargetG, carbsTargetG, fatTargetG };
};

export interface ProfilePayload {
  sex?: Sex | null;
  birthYear?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
  goal?: Goal | null;
  targetWeightKg?: number | null;
  dailyCalorieTarget?: number | null;
  proteinTargetG?: number | null;
  carbsTargetG?: number | null;
  fatTargetG?: number | null;
  dietaryPrefs?: string[];
  allergies?: string[];
  dailyBudgetUsd?: number | null;
  timezone?: string | null;
}

// Zod .partial() + exactOptionalPropertyTypes friendly: only write keys the
// caller actually supplied so a PATCH-like semantic falls out naturally.
const buildWriteData = (p: ProfilePayload): Prisma.UserProfileUpsertArgs['update'] => {
  const d: Prisma.UserProfileUpsertArgs['update'] = {};
  if ('sex' in p) d.sex = p.sex ?? null;
  if ('birthYear' in p) d.birthYear = p.birthYear ?? null;
  if ('heightCm' in p) d.heightCm = p.heightCm ?? null;
  if ('weightKg' in p) d.weightKg = p.weightKg ?? null;
  if ('activityLevel' in p) d.activityLevel = p.activityLevel ?? null;
  if ('goal' in p) d.goal = p.goal ?? null;
  if ('targetWeightKg' in p) d.targetWeightKg = p.targetWeightKg ?? null;
  if ('dailyCalorieTarget' in p) d.dailyCalorieTarget = p.dailyCalorieTarget ?? null;
  if ('proteinTargetG' in p) d.proteinTargetG = p.proteinTargetG ?? null;
  if ('carbsTargetG' in p) d.carbsTargetG = p.carbsTargetG ?? null;
  if ('fatTargetG' in p) d.fatTargetG = p.fatTargetG ?? null;
  if ('dietaryPrefs' in p && p.dietaryPrefs) d.dietaryPrefs = { set: p.dietaryPrefs };
  if ('allergies' in p && p.allergies) d.allergies = { set: p.allergies };
  if ('dailyBudgetUsd' in p) d.dailyBudgetUsd = p.dailyBudgetUsd ?? null;
  if ('timezone' in p) d.timezone = p.timezone ?? null;
  return d;
};

export const upsertProfile = async (userId: string, payload: ProfilePayload) => {
  const writeData = buildWriteData(payload);
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: writeData,
    create: {
      userId,
      sex: payload.sex ?? null,
      birthYear: payload.birthYear ?? null,
      heightCm: payload.heightCm ?? null,
      weightKg: payload.weightKg ?? null,
      activityLevel: payload.activityLevel ?? null,
      goal: payload.goal ?? null,
      targetWeightKg: payload.targetWeightKg ?? null,
      dailyCalorieTarget: payload.dailyCalorieTarget ?? null,
      proteinTargetG: payload.proteinTargetG ?? null,
      carbsTargetG: payload.carbsTargetG ?? null,
      fatTargetG: payload.fatTargetG ?? null,
      dietaryPrefs: payload.dietaryPrefs ?? [],
      allergies: payload.allergies ?? [],
      dailyBudgetUsd: payload.dailyBudgetUsd ?? null,
      timezone: payload.timezone ?? null,
    },
  });

  return withDerived(profile);
};

export const getProfile = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) throw new NotFoundError('Profile not found');
  return withDerived(profile);
};

export const getProfileOrNull = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  return profile ? withDerived(profile) : null;
};

export const deleteProfile = async (userId: string) => {
  const existing = await prisma.userProfile.findUnique({ where: { userId } });
  if (!existing) throw new NotFoundError('Profile not found');
  await prisma.userProfile.delete({ where: { userId } });
};

const withDerived = (p: UserProfile) => {
  const derived = deriveTargets(p);
  return {
    ...p,
    // The stored target wins (manual override); otherwise fall back to derived.
    effectiveCalorieTarget: p.dailyCalorieTarget ?? derived.dailyCalorieTarget,
    effectiveProteinTargetG: p.proteinTargetG ?? derived.proteinTargetG,
    effectiveCarbsTargetG: p.carbsTargetG ?? derived.carbsTargetG,
    effectiveFatTargetG: p.fatTargetG ?? derived.fatTargetG,
    derived,
  };
};
