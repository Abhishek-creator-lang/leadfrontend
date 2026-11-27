import { APP_NAME } from '@/constants/app';
import { LEGAL } from '@/constants/legal';

const L = LEGAL;

export const PRIVACY_MD = `
This Privacy Policy explains how ${L.operatorName} ("**we**") collects and uses personal data when you use ${APP_NAME} (the "**Site**"). We follow India's Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000 and its rules.

**In short:** browsing needs no account. If you create one, we keep only what is needed to run it. We show no ads, use no cookies for tracking, and never sell your data. We count visits with privacy-friendly analytics that never identifies you.

## 1. Data we collect

| Data | When | Why |
|---|---|---|
| Name, email address | When you create an account or are invited | To identify your account and send account emails (verification, password reset) |
| Password | When you set one | Stored only as a salted one-way hash; we can't read it |
| Session cookie (\`lf_session\`) | When you sign in | Keeps you signed in. It is an essential cookie; there are no advertising or analytics cookies |
| Anonymous usage statistics (page visited, referrer, country, device type, and events such as "question completed") | Every visit | To learn which pages and features help people, using Vercel Web Analytics. It sets no cookies, stores nothing in your browser and does not identify you or link visits across days |
| Progress, bookmarks, notes, activity dates | While you use the Site signed in | To save your progress across devices |
| Contribution details | Only if you contribute | Payments go through your UPI app; we don't receive your card or bank details |
| Technical logs (IP address, browser, time) | Every request, kept by our hosting provider | Security, abuse prevention and troubleshooting |

If you answer a mock interview by voice, your browser's built-in speech recognition turns your speech into text (in Chrome this is processed by Google under its own terms). We don't record or store audio, and the transcript stays in your browser.

If you turn on the optional on-device AI in Chrome, the follow-up questions, answer checks and report summary are produced by Chrome's built-in model on your device. Your answers are processed in your browser and never sent to us. Chrome downloads its model from Google once, under Google's terms.

Without an account, progress and preferences (such as the theme) are stored **only in your browser** (local storage) and never sent to us.

## 2. Legal basis

We process account data with your **consent**, given when you create an account, and for legitimate uses allowed by law, such as security and complying with legal obligations. You can withdraw consent at any time by deleting your account (section 5). Withdrawing doesn't affect processing done before.

## 3. Who we share data with

We don't sell or rent personal data. We share it only with service providers that process it for us under their own security and privacy terms:

${L.processors.map((p) => `- ${p}`).join('\n')}

We may also disclose data where the law requires it, or to protect the Site, our users or the public. These providers may store data on servers outside India.

## 4. How long we keep data

- Account data: while your account exists, and up to 30 days after you ask us to delete it (backups may take up to 90 days to roll over).
- Sign-in sessions: until you sign out or they expire.
- Email links are single-use and expire: password reset after 1 hour, email verification after 24 hours, invitations after 72 hours.
- Hosting logs: as set by our hosting provider, usually up to 30 days.

## 5. Your rights

You can ask us to:

- tell you what personal data we hold about you and how we use it;
- correct or update it (you can also change your name and password on the Account page);
- **delete your account and data**;
- withdraw consent;
- nominate someone to exercise your rights if you die or become incapacitated.

Email ${L.contactEmail} from the address on your account. We respond within 30 days. You may also complain to the Data Protection Board of India.

## 6. Grievance Officer

**${L.operatorName}**, ${L.contactEmail}. We acknowledge grievances within 72 hours and aim to resolve them within 30 days.

## 7. Security

We use HTTPS, hashed passwords, single-use expiring email links, server-side access checks and minimal data collection. No method is completely secure; if a breach affects your data we will notify you and the authorities as the law requires.

## 8. Children

The Site is meant for adults preparing for job interviews. If you are under 18, use it only with a parent's or guardian's consent. We do not knowingly collect children's data without it; contact us and we will delete it.

## 9. Changes

We may update this policy. The "Last updated" date shows the latest version. If a change is significant, we will tell signed-in users by email or on the Site.

## 10. Contact

${L.operatorName}, ${L.contactEmail}
`;
