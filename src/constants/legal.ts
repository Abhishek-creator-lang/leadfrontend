/**
 * Operator details used by the legal pages (Terms, Privacy, Disclaimer, Copyright).
 * Replace every [PLACEHOLDER] before launch and have a lawyer review the pages.
 */
export const LEGAL = {
  /** The individual who runs the site. */
  operatorName: '[YOUR FULL NAME]',
  /** Takedown, privacy, grievance and general legal contact. */
  contactEmail: 'legal@[your-domain]',
  /** City and state whose courts have exclusive jurisdiction. */
  jurisdictionCity: '[CITY], [STATE]',
  country: 'India',
  effectiveDate: '23 November 2026',
  /** Service providers that process data on our behalf. */
  processors: [
    'Vercel Inc. (website hosting)',
    'Neon Inc. (database hosting)',
    'our email delivery provider (account emails)',
  ],
} as const;

/** True once the placeholders above have been replaced. */
export const LEGAL_PLACEHOLDERS_FILLED = !Object.values(LEGAL).some(
  (v) => typeof v === 'string' && /\[[A-Z -]+\]|\[your-domain\]/.test(v)
);

if (
  !LEGAL_PLACEHOLDERS_FILLED &&
  process.env.NODE_ENV === 'production' &&
  typeof window === 'undefined'
) {
  console.warn(
    '[legal] src/constants/legal.ts still has placeholders: fill them in before launch.'
  );
}
