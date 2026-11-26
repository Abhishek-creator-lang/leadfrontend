import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import MockInterviewPage from '@/views/mock/MockInterviewPage';

export const metadata: Metadata = pageMetadata({
  title: 'Free Frontend Mock Interview for Senior & Lead Engineers',
  description:
    'Run a timed frontend mock interview: JavaScript coding, React UI, system design and behavioral rounds, graded against a lead-level rubric. Free, no sign-up.',
  path: PATHS.mockInterview,
});

export default function Page() {
  return <MockInterviewPage />;
}
