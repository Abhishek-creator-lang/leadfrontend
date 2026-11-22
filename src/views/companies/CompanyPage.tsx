'use client';

import { Alert } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { APP_NAME } from '@/constants/app';
import { Markdown } from '@/components/Markdown';
import { SourceNote } from '@/components/SourceNote';
import { ReportIssueLink } from '@/components/ReportIssueLink';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { useContent } from '@/context/ContentContext';
import { Page, PageHeader } from '@/layout/Page';

/** `md` is loaded on the server; `null` when the company file is missing. */
export default function CompanyPage({ slug, md }: { slug: string; md: string | null }) {
  const { getCompany } = useContent();
  const company = getCompany(slug);
  if (!company) return <EmptyState title="Company not found" />;
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.reading}>
      <PageHeader title={company.title} />
      <Alert severity="info" sx={{ mb: 3 }}>
        {APP_NAME} is not affiliated with {company.name}. This guide summarizes publicly shared
        candidate reports, which may be outdated or inaccurate. Follow your recruiter&apos;s
        instructions.
      </Alert>
      <Markdown>{md ?? ''}</Markdown>
      <SourceNote source={company.source} />
      <ReportIssueLink />
    </Page>
  );
}
