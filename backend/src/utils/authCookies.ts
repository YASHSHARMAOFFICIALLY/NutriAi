import type { CookieOptions, Response } from 'express';
import { isProd } from '../config/env';

export const REFRESH_COOKIE = 'nutriai_rt';
export const OAUTH_STATE_COOKIE = 'nutriai_oauth_state';

const refreshCookieOptions = (expiresAt?: Date): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/auth',
  ...(expiresAt ? { expires: expiresAt } : {}),
});

const oauthStateCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/auth/google/callback',
});

export const setRefreshCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions(expiresAt));
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
};

export const setOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    ...oauthStateCookieOptions(),
    maxAge: 10 * 60 * 1000,
  });
};

export const clearOAuthStateCookie = (res: Response): void => {
  res.clearCookie(OAUTH_STATE_COOKIE, oauthStateCookieOptions());
};
