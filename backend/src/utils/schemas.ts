import { z } from 'zod';
import { isSafeExternalHttpsUrl } from './urlSafety';

export const safeHttpsUrlSchema = z.string().url().refine(isSafeExternalHttpsUrl, {
  message: 'imageUrl must be a safe external https URL',
});
