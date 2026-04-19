import cron from 'node-cron';
import { logger } from '../config/logger';
import {
  getUsersAtRisk,
  getUsersForWeeklyDigest,
  buildWeeklyDigestData,
} from '../services/digestService';
import { sendStreakRiskEmail, sendWeeklyDigestEmail } from '../services/emailService';

const BATCH = 50;

const runStreakRisk = async (): Promise<void> => {
  try {
    const users = await getUsersAtRisk();
    for (let i = 0; i < users.length; i += BATCH) {
      const slice = users.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        slice.map((u) => sendStreakRiskEmail(u.email, u.name ?? 'there', u.streak)),
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      logger.info({ total: slice.length, ok }, 'streak-risk batch sent');
    }
  } catch (err) {
    logger.error({ err }, 'streak-risk job failed');
  }
};

const runWeeklyDigest = async (): Promise<void> => {
  try {
    const users = await getUsersForWeeklyDigest();
    for (let i = 0; i < users.length; i += BATCH) {
      const slice = users.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        slice.map(async (u) => {
          const data = await buildWeeklyDigestData(u.id);
          return sendWeeklyDigestEmail(u.email, u.name ?? 'there', data);
        }),
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      logger.info({ total: slice.length, ok }, 'weekly-digest batch sent');
    }
  } catch (err) {
    logger.error({ err }, 'weekly-digest job failed');
  }
};

export const scheduleDigestJobs = (): void => {
  // 7 PM UTC daily — streak risk nudge
  cron.schedule('0 19 * * *', () => { void runStreakRisk(); }, { timezone: 'UTC' });
  // 8 AM UTC every Sunday — weekly digest
  cron.schedule('0 8 * * 0', () => { void runWeeklyDigest(); }, { timezone: 'UTC' });
  logger.info('digest jobs scheduled');
};
