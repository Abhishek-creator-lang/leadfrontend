import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';
import InterviewRoom from '@/views/mock/room/InterviewRoom';

export const metadata: Metadata = { title: 'Interview room', robots: NOINDEX };

export default function Page() {
  return <InterviewRoom />;
}
