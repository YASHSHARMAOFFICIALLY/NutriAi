import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { recordAiQueueReject, recordAiTimeout } from '../services/runtimeMetrics';

let active = 0;
const waiters: Array<() => void> = [];

const release = (): void => {
  active = Math.max(0, active - 1);
  const next = waiters.shift();
  if (next) next();
};

const acquire = async (): Promise<() => void> => {
  if (active < env.AI_MAX_CONCURRENT_REQUESTS) {
    active += 1;
    return release;
  }

  let timeout: NodeJS.Timeout | null = null;
  return new Promise((resolve, reject) => {
    const grant = () => {
      if (timeout) clearTimeout(timeout);
      active += 1;
      resolve(release);
    };

    timeout = setTimeout(() => {
      const index = waiters.indexOf(grant);
      if (index >= 0) waiters.splice(index, 1);
      recordAiQueueReject();
      reject(new AppError(503, 'AI_BUSY', 'AI service is busy. Please retry shortly.'));
    }, env.AI_QUEUE_TIMEOUT_MS);

    waiters.push(grant);
  });
};

const withTimeout = async <T>(work: Promise<T>): Promise<T> => {
  let timeout: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => {
          recordAiTimeout();
          reject(new AppError(504, 'AI_TIMEOUT', 'AI provider timed out. Please retry.'));
        }, env.AI_REQUEST_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

export const guardedAiCall = async <T>(work: () => Promise<T>): Promise<T> => {
  const done = await acquire();
  try {
    return await withTimeout(work());
  } finally {
    done();
  }
};

export const getAiGuardState = () => ({
  active,
  waiting: waiters.length,
  maxConcurrent: env.AI_MAX_CONCURRENT_REQUESTS,
  queueTimeoutMs: env.AI_QUEUE_TIMEOUT_MS,
  requestTimeoutMs: env.AI_REQUEST_TIMEOUT_MS,
});
