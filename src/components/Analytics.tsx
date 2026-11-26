import Script from 'next/script';
import { VA_QUEUE_SNIPPET } from '@/lib/analytics';

/**
 * Vercel Web Analytics (cookie-free page views and events). Rendered only in production: the
 * script path exists only on Vercel deployments that have Web Analytics enabled in the dashboard.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Script id="va-queue" strategy="afterInteractive">
        {VA_QUEUE_SNIPPET}
      </Script>
      <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
    </>
  );
}
