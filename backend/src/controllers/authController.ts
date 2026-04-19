import type { Request, RequestHandler, Response } from 'express';
import type { User } from '@prisma/client';
import passport from 'passport';
import { env, isProd } from '../config/env';
import { prisma } from '../config/prisma';
import { googleConfigured } from '../config/passport';
import { issueTokens, revokeRefresh, rotateRefresh } from '../services/authService';
import { AppError, BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

const REFRESH_COOKIE = 'nutriai_rt';

const setRefreshCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/auth',
    expires: expiresAt,
  });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
};

export const googleStart: RequestHandler = (req, res, next) => {
  if (!googleConfigured()) {
    throw new AppError(503, 'OAUTH_NOT_CONFIGURED', 'Google OAuth is not configured');
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};

export const googleCallback: RequestHandler = (req, res, next) => {
  if (!googleConfigured()) {
    throw new AppError(503, 'OAUTH_NOT_CONFIGURED', 'Google OAuth is not configured');
  }
  passport.authenticate('google', { session: false }, async (err: unknown, user: User | false) => {
    if (err) return next(err);
    if (!user) return next(new UnauthorizedError('Google authentication failed'));
    try {
      const tokens = await issueTokens(user);
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
  const tokens = await rotateRefresh(presented);
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
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
  const tokens = await issueTokens(user);
  setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  });
};
