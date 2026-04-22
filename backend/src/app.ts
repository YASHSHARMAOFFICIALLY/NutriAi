import 'express-async-errors';
import { randomUUID } from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env, isProd } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { rateLimit } from './middleware/rateLimit';
import { requestMetrics } from './middleware/metrics';
import { configureGooglePassport, passport } from './config/passport';
import { healthHandler, metricsHandler, readinessHandler } from './controllers/healthController';
import { authRouter } from './routes/auth.routes';
import { foodRouter } from './routes/food.routes';
import { historyRouter } from './routes/history.routes';
import { mealRouter } from './routes/meal.routes';
import { chatRouter } from './routes/chat.routes';
import { uploadRouter } from './routes/upload.routes';
import { profileRouter } from './routes/profile.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { recommendationRouter } from './routes/recommendation.routes';
import { apiKeyRouter } from './routes/apiKey.routes';
import { publicRouter } from './routes/public.routes';
import { challengeRouter } from './routes/challenge.routes';
import { weightRouter } from './routes/weight.routes';
import { adminRouter } from './routes/admin.routes';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  // Assign a unique request ID for tracing.
  app.use((req, res, next) => {
    const id = randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-Id', id);
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'none'"],
          imgSrc: ["'none'"],
          connectSrc: ["'none'"],
          fontSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
      // Strict-Transport-Security: 1 year + includeSubDomains in production.
      strictTransportSecurity: isProd
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger, genReqId: (req) => req.headers['x-request-id'] as string }));
  app.use(requestMetrics);

  configureGooglePassport();
  app.use(passport.initialize());

  // Liveness probe is exempt from rate limiting.
  app.get('/health', healthHandler);
  app.get('/ready', readinessHandler);
  app.get('/metrics', metricsHandler);

  app.use(rateLimit());

  app.use('/auth', authRouter);
  app.use(foodRouter);
  app.use(historyRouter);
  app.use(mealRouter);
  app.use(chatRouter);
  app.use(uploadRouter);
  app.use(profileRouter);
  app.use(analyticsRouter);
  app.use(recommendationRouter);
  app.use(apiKeyRouter);
  app.use(publicRouter);
  app.use('/challenges', challengeRouter);
  app.use(weightRouter);
  app.use('/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
