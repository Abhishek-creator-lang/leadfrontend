'use client';

import { EmptyState } from '@/components/EmptyState';
import { Markdown } from '@/components/Markdown';
import { SourceNote } from '@/components/SourceNote';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { getCompany } from '@/content';
import { Page, PageHeader } from '@/layout/Page';

/** `md` is loaded on the server; `null` when the company file is missing. */
export default function CompanyPage({ slug, md }: { slug: string; md: string | null }) {
  const company = getCompany(slug);
  if (!company) return <EmptyState title="Company not found" />;
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.reading}>
      <PageHeader title={company.title} />
      <Markdown>{md ?? ''}</Markdown>
      <SourceNote source={company.source} />
    </Page>
  );
}
