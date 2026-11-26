import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';
import { ReactNode } from 'react';
import { APP_DESCRIPTION, APP_NAME, APP_TITLE } from '@/constants/app';
import { themeInitScript } from '@/context/themeInit';
import { AppShell } from '@/layout/AppShell';
import { getCurrentUser } from '@/server/auth/dal';
import { loadUserProgress } from '@/server/repositories/progress';
import { getSupportSettings } from '@/server/support';
import { getContent, toClientIndex } from '@/server/content/catalog';
import { isSupportActive } from '@/lib/validation/support';
import { DARK_TOKENS, LIGHT_TOKENS } from '@/theme/tokens';
import { Providers } from './providers';
import { JsonLd } from '@/components/seo/JsonLd';
import { Analytics } from '@/components/Analytics';
import { siteLd, siteUrl } from '@/lib/seo';

/** Fonts: Manrope (headings), Inter (UI and body), JetBrains Mono (code). Stacks: src/theme/fonts.ts. */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-heading',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

/** Mobile browser UI follows the color scheme. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: LIGHT_TOKENS.themeColor },
    { media: '(prefers-color-scheme: dark)', color: DARK_TOKENS.themeColor },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: APP_TITLE, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  // Raster sizes (multiples of 48px) are what Google Search reliably uses; the SVG is for browsers.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    locale: 'en_US',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: APP_TITLE, description: APP_DESCRIPTION },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reads the session cookie, so every page renders per request. Guests (no cookie) skip the DB.
  const user = await getCurrentUser();
  const [initialProgress, support, { content }] = await Promise.all([
    user ? loadUserProgress(user.id) : null,
    getSupportSettings(),
    getContent(),
  ]);

  const clientContent = toClientIndex(content);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <JsonLd data={siteLd()} />
        <Providers
          key={user?.id ?? 'guest'}
          user={user}
          initialProgress={initialProgress}
          content={clientContent}
          support={isSupportActive(support) ? support : null}
        >
          <AppShell>{children}</AppShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
