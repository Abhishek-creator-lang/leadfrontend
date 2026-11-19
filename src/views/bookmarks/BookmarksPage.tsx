'use client';

import { EmptyState } from '@/components/EmptyState';
import { QuestionList } from '@/components/QuestionList';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { PAGE_TITLES } from '@/constants/navigation';
import { getQuestions } from '@/content';
import { Page, PageHeader } from '@/layout/Page';
import { useAppSelector } from '@/store';

export default function BookmarksPage() {
  const bookmarked = useAppSelector((s) => s.progress.bookmarked);
  const questions = getQuestions(Object.keys(bookmarked));
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.narrow}>
      <PageHeader title={PAGE_TITLES.bookmarks} subtitle="Questions you saved to revisit." />
      {questions.length ? (
        <QuestionList questions={questions} />
      ) : (
        <EmptyState
          title="No bookmarks yet"
          description="Use the bookmark icon on any question to save it here."
        />
      )}
    </Page>
  );
}
