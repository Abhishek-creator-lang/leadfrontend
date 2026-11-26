/**
 * Privacy-friendly analytics (Vercel Web Analytics: no cookies, no personal data, no consent banner).
 * The script is served by Vercel at /_vercel/insights/script.js, so there is no npm dependency and
 * nothing loads outside production. See <Analytics /> in src/components/Analytics.tsx.
 *
 * Note: page views work on every Vercel plan; custom events only show up on Pro and above. On the
 * free plan `track` is a harmless no-op on Vercel's side.
 */

export type AnalyticsEvent =
  | 'register'
  | 'question_completed'
  | 'plan_started'
  | 'share_clicked'
  | 'mock_started'
  | 'mock_completed';

type EventData = Record<string, string | number | boolean | null>;

type VaQueue = (...args: unknown[]) => void;

declare global {
  interface Window {
    va?: VaQueue;
    vaq?: unknown[][];
  }
}

/** Inline snippet that queues calls until the Vercel script loads. */
export const VA_QUEUE_SNIPPET =
  'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};';

/** Records a custom event. Safe to call anywhere: it does nothing on the server or in development. */
export function track(name: AnalyticsEvent, data?: EventData) {
  if (typeof window === 'undefined' || typeof window.va !== 'function') return;
  try {
    window.va('event', { name, data });
  } catch {
    // analytics must never break the page
  }
}
