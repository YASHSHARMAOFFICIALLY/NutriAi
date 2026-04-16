import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { rateLimit } from './middleware/rateLimit';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger }));

  // Liveness probe is exempt from rate limiting.
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'nutriai-backend', env: env.NODE_ENV });
  });

  app.use(rateLimit());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
