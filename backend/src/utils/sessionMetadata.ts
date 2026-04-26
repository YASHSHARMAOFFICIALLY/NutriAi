import type { Request } from 'express';

export interface SessionMetadataInput {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceType?: string | null;
  deviceModel?: string | null;
  os?: string | null;
  browser?: string | null;
  location?: string | null;
}

const firstHeaderValue = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const parseBrowser = (ua: string): string | null => {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/OPR\//.test(ua)) return 'Opera';
  return null;
};

const parseOs = (ua: string): string | null => {
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
  if (/Windows NT/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return null;
};

const parseDeviceType = (ua: string): string | null => {
  if (/iPad|Tablet/.test(ua)) return 'tablet';
  if (/Mobile|iPhone|Android/.test(ua)) return 'mobile';
  if (ua) return 'desktop';
  return null;
};

const parseDeviceModel = (ua: string): string | null => {
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  const androidMatch = ua.match(/Android[^;)]*;\s*([^;)]+)\)/);
  if (androidMatch?.[1]) return androidMatch[1].replace(/Build\/.*/i, '').trim();
  if (/Macintosh/.test(ua)) return 'Mac';
  if (/Windows NT/.test(ua)) return 'Windows PC';
  return null;
};

export const getSessionMetadata = (req: Request): SessionMetadataInput => {
  const userAgent = req.get('user-agent') ?? null;
  const ipAddress = firstHeaderValue(req.headers['x-forwarded-for'])?.split(',')[0]?.trim() || req.ip || null;
  const cfCity = req.get('cf-ipcity');
  const cfRegion = req.get('cf-region');
  const cfCountry = req.get('cf-ipcountry');
  const location = [cfCity, cfRegion, cfCountry].filter(Boolean).join(', ') || null;

  return {
    ipAddress,
    userAgent,
    deviceType: userAgent ? parseDeviceType(userAgent) : null,
    deviceModel: userAgent ? parseDeviceModel(userAgent) : null,
    os: userAgent ? parseOs(userAgent) : null,
    browser: userAgent ? parseBrowser(userAgent) : null,
    location,
  };
};
