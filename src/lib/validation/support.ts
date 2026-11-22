import { z } from 'zod';

/** UPI virtual payment address, e.g. `name@okhdfcbank`. */
export const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

const MAX_AMOUNT = 100_000;

/** "Buy me a coffee" settings, stored under the `support` key of the settings table. */
export const supportSettingsSchema = z
  .object({
    enabled: z.boolean(),
    upiId: z.string().trim().max(256),
    payeeName: z.string().trim().max(60),
    /** Suggested amounts in rupees, shown as chips. Empty = only "any amount". */
    amounts: z.array(z.number().int().positive().max(MAX_AMOUNT)).max(6),
    heading: z.string().trim().min(1, 'Heading is required').max(80),
    message: z.string().trim().max(500),
    /** Note pre-filled in the UPI app (visible to the payer and in your statement). */
    paymentNote: z.string().trim().max(50),
    thankYou: z.string().trim().max(200),
    /** Optional link for supporters outside India (Buy Me a Coffee, Ko-fi, PayPal…). */
    externalUrl: z.union([z.literal(''), z.string().trim().url('Enter a full URL (https://…)')]),
    externalLabel: z.string().trim().max(40),
    showInHeader: z.boolean(),
    showInSidebar: z.boolean(),
    showOnDashboard: z.boolean(),
  })
  .superRefine((s, ctx) => {
    if (!s.enabled) return;
    if (!UPI_ID_PATTERN.test(s.upiId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['upiId'],
        message: 'Enter a valid UPI ID, e.g. name@okhdfcbank',
      });
    }
    if (!s.payeeName) {
      ctx.addIssue({ code: 'custom', path: ['payeeName'], message: 'Payee name is required' });
    }
  });

export type SupportSettings = z.infer<typeof supportSettingsSchema>;

export const DEFAULT_SUPPORT_SETTINGS: SupportSettings = {
  enabled: false,
  upiId: '',
  payeeName: '',
  amounts: [49, 99, 199],
  heading: 'Buy me a coffee',
  message:
    'This site is free for everyone. If it helped your preparation, you can support it with any amount over UPI.',
  paymentNote: 'Support Lead Frontend',
  thankYou: 'Thank you for your support! It keeps the content free for everyone.',
  externalUrl: '',
  externalLabel: 'Support from outside India',
  showInHeader: true,
  showInSidebar: true,
  showOnDashboard: true,
};

/** The support widget is shown only when enabled and configured with a valid UPI ID. */
export const isSupportActive = (s: SupportSettings) =>
  s.enabled && UPI_ID_PATTERN.test(s.upiId) && !!s.payeeName;
