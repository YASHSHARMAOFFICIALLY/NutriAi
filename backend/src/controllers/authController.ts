import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import type { User } from '@prisma/client';
import passport from 'passport';
import { env, isProd } from '../config/env';
import { prisma } from '../config/prisma';
import { googleConfigured } from '../config/passport';
import { issueAuthSession, issueTokens, revokeRefresh, rotateRefresh } from '../services/authService';
import {
  clearOAuthStateCookie,
  clearRefreshCookie,
  OAUTH_STATE_COOKIE,
  REFRESH_COOKIE,
  setOAuthStateCookie,
  setRefreshCookie,
} from '../utils/authCookies';
import { AppError, BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { requireUser } from '../utils/requestUser';
import { getSessionMetadata } from '../utils/sessionMetadata';

const stateMatches = (actual: string, expected: string): boolean => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};

type GoogleAuthenticateOptions = {
  callbackURL: string;
  scope?: string[];
  session: false;
  state?: string;
};

const configuredGoogleCallbackUrl = (): string | null => {
  if (!env.GOOGLE_CALLBACK_URL || env.GOOGLE_CALLBACK_URL.includes('your-backend-domain.com')) return null;
  return env.GOOGLE_CALLBACK_URL;
};

const requestGoogleCallbackUrl = (req: Request): string => {
  const forwardedProto = typeof req.headers['x-forwarded-proto'] === 'string'
    ? req.headers['x-forwarded-proto'].split(',')[0]?.trim()
    : undefined;
  const protocol = forwardedProto || req.protocol || (isProd ? 'https' : 'http');
  return `${protocol}://${req.get('host')}/auth/google/callback`;
};

const googleCallbackUrl = (req: Request): string => configuredGoogleCallbackUrl() ?? requestGoogleCallbackUrl(req);

export const googleStart: RequestHandler = (req, res, next) => {
  if (!googleConfigured()) {
    throw new AppError(503, 'OAUTH_NOT_CONFIGURED', 'Google OAuth is not configured');
  }
  const state = randomBytes(32).toString('base64url');
  setOAuthStateCookie(res, state);
  const options: GoogleAuthenticateOptions = {
    callbackURL: googleCallbackUrl(req),
    scope: ['profile', 'email'],
    session: false,
    state,
  };
  passport.authenticate('google', options)(req, res, next);
};

export const googleCallback: RequestHandler = (req, res, next) => {
  if (!googleConfigured()) {
    throw new AppError(503, 'OAUTH_NOT_CONFIGURED', 'Google OAuth is not configured');
  }
  const expectedState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
  const actualState = typeof req.query.state === 'string' ? req.query.state : '';
  clearOAuthStateCookie(res);
  if (!expectedState || !actualState || !stateMatches(actualState, expectedState)) {
    throw new UnauthorizedError('Invalid OAuth state');
  }
  const options: GoogleAuthenticateOptions = { callbackURL: googleCallbackUrl(req), session: false };
  passport.authenticate('google', options, async (err: unknown, user: User | false) => {
    if (err) return next(err);
    if (!user) return next(new UnauthorizedError('Google authentication failed'));
    try {
      const tokens = await issueTokens(user, getSessionMetadata(req));
      setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
      // Redirect back to frontend with access token in fragment (not query) to avoid server logs.
      const redirectUrl = `${env.FRONTEND_POST_LOGIN_URL}#access_token=${tokens.accessToken}`;
      res.redirect(redirectUrl);
    } catch (e) {
      next(e);
    }
  })(req, res, next);
};

export const refresh: RequestHandler = async (req, res) => {
  const presented = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!presented) throw new UnauthorizedError('Missing refresh token');
  const tokens = await rotateRefresh(presented, getSessionMetadata(req));
  setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
  res.json({ accessToken: tokens.accessToken });
};

export const logout: RequestHandler = async (req, res) => {
  const presented = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (presented) await revokeRefresh(presented);
  clearRefreshCookie(res);
  res.status(204).end();
};

export const me: RequestHandler = async (req, res) => {
  const authUser = requireUser(req);
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError('User not found');
  res.json({ user });
};

// Dev-only: issue a token pair for a seeded/created user by email.
// Gated by NODE_ENV !== 'production' so it cannot leak into production.
export const devLogin: RequestHandler = async (req: Request, res) => {
  if (isProd) throw new NotFoundError();
  const email = (req.body?.email as string | undefined)?.trim().toLowerCase();
  if (!email) throw new BadRequestError('email is required');

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: email.split('@')[0] },
  });
  const { accessToken, refreshToken, refreshExpiresAt, user: authUser } = await issueAuthSession(
    user,
    getSessionMetadata(req),
  );
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.json({
    accessToken,
    user: { id: authUser.id, email: authUser.email, role: authUser.role },
  });
};
