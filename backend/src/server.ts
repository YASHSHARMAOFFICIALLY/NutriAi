import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { redis } from './config/redis';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`nutriai-backend listening on :${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await Promise.allSettled([redis.quit()]);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
