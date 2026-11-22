'use client';

import { Grid, Typography } from '@mui/material';
import { NamedIcon } from '@/components/icons';
import { LinkCard } from '@/components/LinkCard';
import { PAGE_TITLES } from '@/constants/navigation';
import { useContent } from '@/context/ContentContext';
import { Page, PageHeader } from '@/layout/Page';
import { guidePath } from '@/routes/paths';
import { pluralize } from '@/utils/format';

export default function GuidesPage() {
  const { content } = useContent();
  return (
    <Page>
      <PageHeader
        title={PAGE_TITLES.guides}
        subtitle="Read these before you start grinding questions. They explain what interviewers look for at each stage."
      />
      <Grid container spacing={2}>
        {content.guides.map((g) => (
          <Grid item xs={12} md={6} key={g.id}>
            <LinkCard href={guidePath(g.id)} padding={3}>
              <NamedIcon name={g.icon} color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                {g.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {g.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pluralize(g.chapters.length, 'chapter')}
              </Typography>
            </LinkCard>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}
