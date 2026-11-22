'use client';

import { Grid, Typography } from '@mui/material';
import { NamedIcon } from '@/components/icons';
import { LinkCard } from '@/components/LinkCard';
import { ProgressSummary } from '@/components/ProgressSummary';
import { PAGE_TITLES } from '@/constants/navigation';
import { useContent } from '@/context/ContentContext';
import { Page, PageHeader } from '@/layout/Page';
import { focusAreaPath } from '@/routes/paths';
import { useAppSelector } from '@/store';
import { countCompleted } from '@/utils/progress';

export default function FocusAreasPage() {
  const { content } = useContent();
  const completed = useAppSelector((s) => s.progress.completed);
  return (
    <Page>
      <PageHeader
        title={PAGE_TITLES.focusAreas}
        subtitle="Drill one topic at a time to close specific gaps."
      />
      <Grid container spacing={2}>
        {content.focusAreas.map((f) => (
          <Grid item xs={12} sm={6} md={4} key={f.id}>
            <LinkCard href={focusAreaPath(f.id)} padding={3} stack>
              <NamedIcon name={f.icon} color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
                {f.description}
              </Typography>
              <ProgressSummary
                done={countCompleted(f.questions, completed)}
                total={f.questions.length}
              />
            </LinkCard>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}
