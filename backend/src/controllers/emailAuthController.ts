import type { Request, RequestHandler, Response } from 'express';
import type { User } from '@prisma/client';
import { issueAuthSession } from '../services/authService';
import {
  authenticateWithPassword,
  registerWithPassword,
  requestPasswordReset,
  resendVerification,
  resetPasswordWithToken,
  verifyEmailWithToken,
} from '../services/emailAuthService';
import { setRefreshCookie } from '../utils/authCookies';
import { getSessionMetadata } from '../utils/sessionMetadata';

const sendAuthResponse = async (req: Request, res: Response, user: User): Promise<void> => {
  const { accessToken, refreshToken, refreshExpiresAt, user: authUser } = await issueAuthSession(
    user,
    getSessionMetadata(req),
  );
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.json({
    accessToken,
    user: { id: authUser.id, email: authUser.email, name: user.name, role: authUser.role },
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
  await sendAuthResponse(req, res, user);
};

export const verifyEmail: RequestHandler = async (req, res) => {
  const { token } = req.body as { token: string };
  const user = await verifyEmailWithToken(token);
  await sendAuthResponse(req, res, user);
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
  await sendAuthResponse(req, res, user);
};
