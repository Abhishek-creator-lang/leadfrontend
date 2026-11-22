'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createLookups, EMPTY_CONTENT, type ContentLookups } from '@/content/lookups';
import type { ClientContentIndex, QuestionSummary } from '@/content/types';

const ContentContext = createContext<ContentLookups<QuestionSummary>>(
  createLookups<QuestionSummary>(EMPTY_CONTENT)
);

/**
 * Makes the published content index (slim question summaries) available to client components. The root layout passes it once
 * per full page load; App Router keeps the layout (and this provider) across client navigations.
 */
export function ContentProvider({
  content,
  children,
}: {
  content: ClientContentIndex;
  children: ReactNode;
}) {
  const lookups = useMemo(() => createLookups(content), [content]);
  return <ContentContext.Provider value={lookups}>{children}</ContentContext.Provider>;
}

/** Published content + lookups (`getQuestion`, `questionsByFormat`, `FORMAT_COUNTS`…). */
export const useContent = () => useContext(ContentContext);
