import pino from 'pino';
import { env, isProd } from './env';

export const logger = pino({
  level: isProd ? 'info' : 'debug',
  base: { service: 'nutriai-backend', env: env.NODE_ENV },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, singleLine: false, translateTime: 'SYS:HH:MM:ss.l' },
      },
});
