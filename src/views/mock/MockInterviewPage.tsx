'use client';

import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { PAGE_TITLES } from '@/constants/navigation';
import { Page, PageHeader } from '@/layout/Page';
import { LiveInterviewSetup } from './LiveInterviewSetup';

/** Lobby for the live mock interview with Aarav (the interview itself runs in /mock-interview/room). */
export default function MockInterviewPage() {
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.form}>
      <PageHeader
        title={PAGE_TITLES.mockInterview}
        subtitle="A realistic senior and lead frontend interview, spoken or typed. Free, private, runs in your browser."
      />
      <LiveInterviewSetup />
    </Page>
  );
}
