import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { APP_DESCRIPTION, APP_NAME, APP_TITLE } from '@/constants/app';
import { themeInitScript } from '@/context/themeInit';
import { AppShell } from '@/layout/AppShell';
import { getCurrentUser } from '@/server/auth/dal';
import { loadUserProgress } from '@/server/repositories/progress';
import { getSupportSettings } from '@/server/support';
import { isSupportActive } from '@/lib/validation/support';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: APP_TITLE, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  icons: { icon: '/favicon.svg' },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reads the session cookie, so every page renders per request. Guests (no cookie) skip the DB.
  const user = await getCurrentUser();
  const [initialProgress, support] = await Promise.all([
    user ? loadUserProgress(user.id) : null,
    getSupportSettings(),
  ]);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers
          key={user?.id ?? 'guest'}
          user={user}
          initialProgress={initialProgress}
          support={isSupportActive(support) ? support : null}
        >
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
