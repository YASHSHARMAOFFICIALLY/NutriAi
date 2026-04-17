import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import {
  deleteProfile,
  getProfile,
  upsertProfile,
} from '../services/profileService';

const SexSchema = z.enum(['MALE', 'FEMALE', 'OTHER']);
const ActivitySchema = z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']);
const GoalSchema = z.enum(['LOSE', 'MAINTAIN', 'GAIN']);

const currentYear = new Date().getUTCFullYear();

export const upsertProfileSchema = z.object({
  sex: SexSchema.nullable().optional(),
  birthYear: z
    .number()
    .int()
    .min(1900)
    .max(currentYear - 10)
    .nullable()
    .optional(),
  heightCm: z.number().positive().max(300).nullable().optional(),
  weightKg: z.number().positive().max(500).nullable().optional(),
  activityLevel: ActivitySchema.nullable().optional(),
  goal: GoalSchema.nullable().optional(),
  targetWeightKg: z.number().positive().max(500).nullable().optional(),
  dailyCalorieTarget: z.number().int().min(1000).max(10_000).nullable().optional(),
  proteinTargetG: z.number().int().nonnegative().max(1000).nullable().optional(),
  carbsTargetG: z.number().int().nonnegative().max(1500).nullable().optional(),
  fatTargetG: z.number().int().nonnegative().max(500).nullable().optional(),
  dietaryPrefs: z.array(z.string().min(1).max(40)).max(20).optional(),
  allergies: z.array(z.string().min(1).max(40)).max(20).optional(),
  dailyBudgetUsd: z.number().positive().max(10_000).nullable().optional(),
  timezone: z.string().max(60).nullable().optional(),
});

export type UpsertProfileBody = z.infer<typeof upsertProfileSchema>;

export const getProfileHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const profile = await getProfile(req.user.id);
  res.json(profile);
};

export const upsertProfileHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as UpsertProfileBody;
  const profile = await upsertProfile(req.user.id, body);
  res.json(profile);
};

export const deleteProfileHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  await deleteProfile(req.user.id);
  res.status(204).send();
};
