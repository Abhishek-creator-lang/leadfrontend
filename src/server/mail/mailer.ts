import 'server-only';
import nodemailer, { Transporter } from 'nodemailer';
import { siteUrl } from '@/lib/seo';
import { env } from '../env';
import type { MailContent } from './templates';

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env();
  transporter = SMTP_HOST
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      })
    : null;
  return transporter;
}

/**
 * Sends an email. Without SMTP_HOST (local development) the message is printed to the server
 * console instead, so its link can be opened directly.
 */
export async function sendMail(to: string, content: MailContent) {
  const t = getTransporter();
  if (!t) {
    console.info(`\n[mail] To: ${to}\n[mail] Subject: ${content.subject}\n${content.text}\n`);
    return;
  }
  await t.sendMail({ from: env().MAIL_FROM, to, ...content });
}

/** Absolute URL for an email link. */
export const appUrl = (path: string) => new URL(path, siteUrl()).toString();
