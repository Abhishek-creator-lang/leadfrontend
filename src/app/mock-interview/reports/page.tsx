import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';
import ReportsPage from '@/views/mock/ReportsPage';

export const metadata: Metadata = { title: 'Your interview reports', robots: NOINDEX };

export default function Page() {
  return (
    <Suspense>
      <ReportsPage />
    </Suspense>
  );
}
