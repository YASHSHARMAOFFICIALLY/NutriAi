import type { RequestHandler } from 'express';
import { recordHttpRequest } from '../services/runtimeMetrics';

export const requestMetrics: RequestHandler = (req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    recordHttpRequest({
      method: req.method,
      path: req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path,
      statusCode: res.statusCode,
      latencyMs: Date.now() - started,
    });
  });
  next();
};
