import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: Source = 'body'): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.parse(req[source]);
    // Replace with parsed (and possibly coerced) data for downstream handlers.
    (req as unknown as Record<Source, unknown>)[source] = parsed;
    next();
  };
