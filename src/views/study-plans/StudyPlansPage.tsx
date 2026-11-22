'use client';

import { Chip, Grid, Stack, Typography } from '@mui/material';
import { LinkCard } from '@/components/LinkCard';
import { ProgressSummary } from '@/components/ProgressSummary';
import { PAGE_TITLES } from '@/constants/navigation';
import { useContent } from '@/context/ContentContext';
import { Page, PageHeader } from '@/layout/Page';
import { studyPlanPath } from '@/routes/paths';
import { useAppSelector } from '@/store';
import { countCompleted, planQuestionIds } from '@/utils/progress';
import { PlanStats } from './PlanStats';

export default function StudyPlansPage() {
  const { content } = useContent();
  const completed = useAppSelector((s) => s.progress.completed);
  const started = useAppSelector((s) => s.progress.startedPlans);

  return (
    <Page>
      <PageHeader
        title={PAGE_TITLES.studyPlans}
        subtitle="Structured schedules for your timeline, from one week to three months, plus a dedicated senior/lead track."
      />
      <Grid container spacing={2}>
        {content.studyPlans.map((p) => {
          const ids = planQuestionIds(p);
          return (
            <Grid item xs={12} md={6} key={p.id}>
              <LinkCard href={studyPlanPath(p.id)} padding={3} stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{p.title}</Typography>
                  {started[p.id] && <Chip size="small" color="primary" label="In progress" />}
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {p.subtitle}
                </Typography>
                <PlanStats plan={p} />
                <ProgressSummary done={countCompleted(ids, completed)} total={ids.length} />
              </LinkCard>
            </Grid>
          );
        })}
      </Grid>
    </Page>
  );
}
