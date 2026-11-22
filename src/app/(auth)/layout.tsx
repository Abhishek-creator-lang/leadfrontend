import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { NOINDEX } from '@/lib/seo';

/** Sign-in, sign-up and email-link screens stay out of search results. */
export const metadata: Metadata = { robots: NOINDEX };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
