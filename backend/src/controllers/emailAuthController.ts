import type { RequestHandler, Response } from 'express';
import { isProd } from '../config/env';
import { issueTokens } from '../services/authService';
import {
  authenticateWithPassword,
  registerWithPassword,
  requestPasswordReset,
  resendVerification,
  resetPasswordWithToken,
  verifyEmailWithToken,
} from '../services/emailAuthService';
import { getSessionMetadata } from '../utils/sessionMetadata';

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

export const register: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body as { email: string; password: string; name?: string };
  await registerWithPassword({ email, password, name });
  res.status(201).json({ ok: true, verificationRequired: true });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await authenticateWithPassword({ email, password });
  const tokens = await issueTokens(user, getSessionMetadata(req));
  setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
  res.json({
    accessToken: tokens.accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
};

export const verifyEmail: RequestHandler = async (req, res) => {
  const { token } = req.body as { token: string };
  const user = await verifyEmailWithToken(token);
  const tokens = await issueTokens(user, getSessionMetadata(req));
  setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
  res.json({
    accessToken: tokens.accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
};

export const resendVerify: RequestHandler = async (req, res) => {
  const { email } = req.body as { email: string };
  await resendVerification(email);
  res.json({ ok: true });
};

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body as { email: string };
  await requestPasswordReset(email);
  res.json({ ok: true });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { token, password } = req.body as { token: string; password: string };
  const user = await resetPasswordWithToken({ token, newPassword: password });
  const tokens = await issueTokens(user, getSessionMetadata(req));
  setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
  res.json({
    accessToken: tokens.accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
};
