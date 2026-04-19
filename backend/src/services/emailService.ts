import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';

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

export async function sendFamilyInviteEmail(
  to: string,
  inviterName: string,
): Promise<void> {
  const url = `${env.FRONTEND_URL}/family?tab=pending`;
  const html = layout(
    `${inviterName} wants to share their nutrition with you`,
    `${inviterName} invited you to view their meals, streak, and daily progress on NutriAI. You'll only be able to view — never edit or delete their data.`,
    'Review invite',
    url,
    `You can accept or ignore this invite anytime from your NutriAI settings.`,
  );
  const text = `${inviterName} invited you to view their NutriAI data. Review: ${url}`;
  await send(to, `${inviterName} invited you to view their nutrition — NutriAI`, html, text);
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
