import 'server-only';
import { APP_NAME } from '@/constants/app';

export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

interface ActionMail {
  subject: string;
  greeting: string;
  lines: string[];
  cta: string;
  url: string;
  expires: string;
}

/** A simple transactional email with one call-to-action link, as HTML and plain text. */
function actionMail({ subject, greeting, lines, cta, url, expires }: ActionMail): MailContent {
  const text = [
    greeting,
    '',
    ...lines,
    '',
    `${cta}: ${url}`,
    '',
    `This link expires in ${expires}.`,
    'If you did not expect this email, you can ignore it.',
    '',
    `— ${APP_NAME}`,
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="font-family: Inter, Arial, sans-serif; color: #0f172a; line-height: 1.6">
    <div style="max-width: 520px; margin: 0 auto; padding: 24px">
      <h2 style="margin: 0 0 16px">${escapeHtml(APP_NAME)}</h2>
      <p>${escapeHtml(greeting)}</p>
      ${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('\n      ')}
      <p>
        <a href="${escapeHtml(url)}" style="display: inline-block; background: #6366f1; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600">${escapeHtml(cta)}</a>
      </p>
      <p style="color: #475569; font-size: 13px">
        This link expires in ${escapeHtml(expires)}. If the button doesn't work, paste this URL into
        your browser:<br />${escapeHtml(url)}
      </p>
      <p style="color: #475569; font-size: 13px">If you did not expect this email, you can ignore it.</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

export const verifyEmailMail = (name: string, url: string) =>
  actionMail({
    subject: `Confirm your email for ${APP_NAME}`,
    greeting: `Hi ${name},`,
    lines: ['Thanks for signing up. Confirm your email address to activate your account.'],
    cta: 'Confirm email',
    url,
    expires: '24 hours',
  });

export const resetPasswordMail = (name: string, url: string) =>
  actionMail({
    subject: `Reset your ${APP_NAME} password`,
    greeting: `Hi ${name},`,
    lines: ['We received a request to reset your password. Choose a new one using the link below.'],
    cta: 'Reset password',
    url,
    expires: '1 hour',
  });

export const inviteMail = (name: string, inviter: string, role: string, url: string) =>
  actionMail({
    subject: `You've been invited to ${APP_NAME}`,
    greeting: `Hi ${name},`,
    lines: [`${inviter} created ${role} account for you. Set your password to get started.`],
    cta: 'Set up your account',
    url,
    expires: '3 days',
  });
