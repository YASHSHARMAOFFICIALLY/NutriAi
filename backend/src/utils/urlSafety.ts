import { isIP } from 'node:net';

const LOCAL_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

export const isSafeExternalHttpsUrl = (value: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;
  if (parsed.username || parsed.password) return false;
  if (parsed.port && parsed.port !== '443') return false;

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) return false;
  if (LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) return false;

  // Reject direct IP literals entirely. They are rarely needed for end-user
  // image URLs and substantially reduce SSRF-style abuse cases.
  if (isIP(hostname) !== 0) return false;

  return true;
};
