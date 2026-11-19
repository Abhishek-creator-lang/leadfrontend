'use client';

import { EmptyState } from '@/components/EmptyState';
import { QuestionList } from '@/components/QuestionList';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { getFocusArea, getQuestions } from '@/content';
import { Page, PageHeader } from '@/layout/Page';

export default function FocusAreaDetailPage({ id }: { id: string }) {
  const area = getFocusArea(id);
  if (!area) return <EmptyState title="Focus area not found" />;
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.narrow}>
      <PageHeader title={area.title} subtitle={area.description} />
      <QuestionList questions={getQuestions(area.questions)} numbered />
    </Page>
  );
}
