import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';
import type { WeeklyDigestData } from './digestService';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  // Dev / unconfigured fallback: log the email so flows can still be tested.
  if (!resend) {
    logger.warn({ to, subject, text }, 'RESEND_API_KEY not set — email logged instead of sent');
    return;
  }
  const result = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html, text });
  if (result.error) {
    throw new Error(`Email send failed: ${result.error.message}`);
  }
}

function layout(heading: string, intro: string, ctaLabel: string, ctaUrl: string, footer: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:40px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;color:#5E8A69;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">NutriAI</p>
          <h1 style="margin:0 0 16px;font-size:24px;color:#121410;font-weight:700;">${heading}</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a4a4a;">${intro}</p>
          <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#1F3B2D;color:#F5F1E8;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">${ctaLabel}</a>
          <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#888;">${footer}</p>
          <p style="margin:16px 0 0;font-size:11px;color:#aaa;word-break:break-all;">Or paste this link: ${ctaUrl}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${env.FRONTEND_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const html = layout(
    'Confirm your email',
    'Welcome to NutriAI! Tap below to confirm this email and start tracking what you eat.',
    'Verify email',
    url,
    `This link expires in ${env.EMAIL_VERIFICATION_TTL_HOURS} hours. If you didn't sign up, you can ignore this email.`,
  );
  const text = `Confirm your email for NutriAI: ${url}`;
  await send(to, 'Confirm your email — NutriAI', html, text);
}

export async function sendStreakRiskEmail(to: string, name: string, streak: number): Promise<void> {
  const settingsUrl = `${env.FRONTEND_URL}/settings?focus=notifications`;
  const dashUrl = `${env.FRONTEND_URL}/snap`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:40px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;color:#5E8A69;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">NutriAI</p>
          <h1 style="margin:0 0 16px;font-size:24px;color:#121410;font-weight:700;">Your ${streak}-day streak is at risk 🔥</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a4a4a;">Hey ${name}, you haven't logged a meal today yet. Log dinner now to keep your ${streak}-day streak alive.</p>
          <a href="${dashUrl}" style="display:inline-block;padding:12px 24px;background:#1F3B2D;color:#F5F1E8;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Log a meal now</a>
          <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#888;">You're receiving this because streak reminders are on. <a href="${settingsUrl}" style="color:#5E8A69;">Turn off</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `Your ${streak}-day streak is at risk! Log a meal at ${dashUrl}`;
  await send(to, `Your ${streak}-day streak is at risk — NutriAI`, html, text);
}

export async function sendWeeklyDigestEmail(to: string, name: string, data: WeeklyDigestData): Promise<void> {
  const dashUrl = `${env.FRONTEND_URL}/dashboard`;
  const settingsUrl = `${env.FRONTEND_URL}/settings?focus=notifications`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:40px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;color:#5E8A69;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">NutriAI · Weekly Digest</p>
          <h1 style="margin:0 0 8px;font-size:24px;color:#121410;font-weight:700;">Your week in nutrition</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#4a4a4a;">Here's how you did last week, ${name}.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#F5F1E8;border-radius:12px;padding:16px;text-align:center;width:25%;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#1F3B2D;">${data.totalMeals}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Meals</p>
              </td>
              <td style="width:8px;"></td>
              <td style="background:#F5F1E8;border-radius:12px;padding:16px;text-align:center;width:25%;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#1F3B2D;">${data.avgCalories}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Avg kcal</p>
              </td>
              <td style="width:8px;"></td>
              <td style="background:#F5F1E8;border-radius:12px;padding:16px;text-align:center;width:25%;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#1F3B2D;">${data.currentStreak}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Day streak</p>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#121410;">Macro split</p>
          <p style="margin:0 0 4px;font-size:13px;color:#4a4a4a;">Protein ${data.macroSplit.protein}% · Carbs ${data.macroSplit.carbs}% · Fat ${data.macroSplit.fat}%</p>
          <p style="margin:0 0 24px;font-size:13px;color:#888;">Best day: ${data.bestDayLabel}</p>
          <a href="${dashUrl}" style="display:inline-block;padding:12px 24px;background:#1F3B2D;color:#F5F1E8;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">View dashboard</a>
          <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#888;">You're receiving this weekly digest. <a href="${settingsUrl}" style="color:#5E8A69;">Manage preferences</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `Your weekly NutriAI digest: ${data.totalMeals} meals, avg ${data.avgCalories} kcal/day, ${data.currentStreak}-day streak. View dashboard: ${dashUrl}`;
  await send(to, 'Your weekly nutrition digest — NutriAI', html, text);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${env.FRONTEND_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const html = layout(
    'Reset your password',
    'Someone asked to reset your NutriAI password. If that was you, tap below to choose a new one.',
    'Reset password',
    url,
    `This link expires in ${env.PASSWORD_RESET_TTL_HOURS} hour(s). If you didn't request this, you can safely ignore this email.`,
  );
  const text = `Reset your NutriAI password: ${url}`;
  await send(to, 'Reset your password — NutriAI', html, text);
}
