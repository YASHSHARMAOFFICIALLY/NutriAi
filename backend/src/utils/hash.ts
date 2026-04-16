import { createHash, randomBytes } from 'node:crypto';

export const sha256Hex = (input: string | Buffer): string =>
  createHash('sha256').update(input).digest('hex');

export const randomTokenUrlSafe = (bytes = 48): string =>
  randomBytes(bytes).toString('base64url');
