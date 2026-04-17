import { describe, expect, it } from 'vitest';
import { deriveTargets } from '../src/services/profileService';
import { upsertProfileSchema } from '../src/controllers/profileController';

describe('deriveTargets (Mifflin-St Jeor + activity + goal)', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('returns nulls when required inputs are missing', () => {
    const d = deriveTargets({ sex: 'MALE', weightKg: 70 }, now);
    expect(d.bmr).toBeNull();
    expect(d.tdee).toBeNull();
    expect(d.dailyCalorieTarget).toBeNull();
  });

  it('computes BMR/TDEE/target for a complete male profile', () => {
    const d = deriveTargets(
      {
        sex: 'MALE',
        birthYear: 1996,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'MODERATE',
        goal: 'MAINTAIN',
      },
      now,
    );
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(d.bmr).toBe(1780);
    // 1780 * 1.55 = 2759
    expect(d.tdee).toBe(2759);
    expect(d.dailyCalorieTarget).toBe(2759);
    expect(d.proteinTargetG).toBeGreaterThan(0);
    expect(d.carbsTargetG).toBeGreaterThan(0);
    expect(d.fatTargetG).toBeGreaterThan(0);
  });

  it('applies the LOSE delta and enforces a 1200 kcal floor', () => {
    const d = deriveTargets(
      {
        sex: 'FEMALE',
        birthYear: 1990,
        heightCm: 160,
        weightKg: 55,
        activityLevel: 'SEDENTARY',
        goal: 'LOSE',
      },
      now,
    );
    expect(d.dailyCalorieTarget).toBeGreaterThanOrEqual(1200);
  });

  it('applies the GAIN delta', () => {
    const base = deriveTargets(
      {
        sex: 'MALE',
        birthYear: 1996,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'MODERATE',
        goal: 'MAINTAIN',
      },
      now,
    );
    const gain = deriveTargets(
      {
        sex: 'MALE',
        birthYear: 1996,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'MODERATE',
        goal: 'GAIN',
      },
      now,
    );
    expect(gain.dailyCalorieTarget).toBe((base.dailyCalorieTarget ?? 0) + 300);
  });
});

describe('upsertProfileSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const parsed = upsertProfileSchema.parse({});
    expect(parsed).toBeDefined();
  });

  it('accepts a full profile', () => {
    const parsed = upsertProfileSchema.parse({
      sex: 'FEMALE',
      birthYear: 1995,
      heightCm: 165,
      weightKg: 62,
      activityLevel: 'LIGHT',
      goal: 'LOSE',
      targetWeightKg: 58,
      dietaryPrefs: ['vegetarian', 'low-sodium'],
      allergies: ['peanuts'],
      dailyBudgetUsd: 15,
      timezone: 'America/Los_Angeles',
    });
    expect(parsed.dietaryPrefs).toHaveLength(2);
  });

  it('rejects an implausible birthYear', () => {
    expect(() => upsertProfileSchema.parse({ birthYear: 1800 })).toThrow();
  });

  it('rejects negative weight', () => {
    expect(() => upsertProfileSchema.parse({ weightKg: -10 })).toThrow();
  });

  it('rejects an unknown activityLevel', () => {
    expect(() => upsertProfileSchema.parse({ activityLevel: 'EXTREME' })).toThrow();
  });

  it('rejects more than 20 dietary prefs', () => {
    const prefs = Array.from({ length: 21 }, (_, i) => `p${i}`);
    expect(() => upsertProfileSchema.parse({ dietaryPrefs: prefs })).toThrow();
  });
});
