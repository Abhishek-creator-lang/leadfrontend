import { Card, Typography } from '@mui/material';
import { Markdown } from '@/components/Markdown';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { LEGAL } from '@/constants/legal';
import { Page, PageHeader } from '@/layout/Page';

/** Shared layout for Terms, Privacy, Disclaimer, Copyright and Licenses. */
export function LegalPage({ title, md }: { title: string; md: string }) {
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.reading}>
      <PageHeader title={title} subtitle={`Last updated ${LEGAL.effectiveDate}`} />
      <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Markdown>{md}</Markdown>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 4 }}>
          This page is provided for information and is not legal advice.
        </Typography>
      </Card>
    </Page>
  );
}
