import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';
import { AppError } from '../utils/errors';

let client: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (client) return client;

  const hasCreds = env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY;
  client = new S3Client({
    region: env.AWS_REGION,
    endpoint: env.AWS_S3_ENDPOINT,
    forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
    // If creds are not supplied, fall back to the default provider chain
    // (IAM role, environment, shared config, etc).
    credentials: hasCreds
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
        }
      : undefined,
  });
  return client;
};

export const requireBucket = (): string => {
  if (!env.AWS_S3_BUCKET) {
    throw new AppError(503, 'S3_NOT_CONFIGURED', 'AWS_S3_BUCKET is not set');
  }
  return env.AWS_S3_BUCKET;
};

// Test hook.
export const resetS3Client = (): void => {
  client = null;
};
