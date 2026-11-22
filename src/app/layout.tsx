import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';
import { ReactNode } from 'react';
import { APP_DESCRIPTION, APP_NAME, APP_TITLE } from '@/constants/app';
import { themeInitScript } from '@/context/themeInit';
import { AppShell } from '@/layout/AppShell';
import { getCurrentUser } from '@/server/auth/dal';
import { loadUserProgress } from '@/server/repositories/progress';
import { getSupportSettings } from '@/server/support';
import { getContent } from '@/server/content/catalog';
import { isSupportActive } from '@/lib/validation/support';
import { DARK_TOKENS, LIGHT_TOKENS } from '@/theme/tokens';
import { Providers } from './providers';

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
  title: { default: APP_TITLE, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  icons: { icon: '/favicon.svg' },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reads the session cookie, so every page renders per request. Guests (no cookie) skip the DB.
  const user = await getCurrentUser();
  const [initialProgress, support, { content }] = await Promise.all([
    user ? loadUserProgress(user.id) : null,
    getSupportSettings(),
    getContent(),
  ]);

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
        <Providers
          key={user?.id ?? 'guest'}
          user={user}
          initialProgress={initialProgress}
          content={content}
          support={isSupportActive(support) ? support : null}
        >
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
