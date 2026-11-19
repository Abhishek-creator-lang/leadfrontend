'use client';

import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { ProgressSummary } from '@/components/ProgressSummary';
import { QuestionList } from '@/components/QuestionList';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { getQuestions, getStudyPlan } from '@/content';
import { Page, PageHeader } from '@/layout/Page';
import { useAppDispatch, useAppSelector } from '@/store';
import { leavePlan, startPlan } from '@/store/progressSlice';
import { countCompleted, planQuestionIds } from '@/utils/progress';
import { PlanStats } from './PlanStats';

export default function StudyPlanDetailPage({ id }: { id: string }) {
  const plan = getStudyPlan(id);
  const dispatch = useAppDispatch();
  const completed = useAppSelector((s) => s.progress.completed);
  const started = useAppSelector((s) => s.progress.startedPlans[id]);

  if (!plan) return <EmptyState title="Study plan not found" />;
  const ids = planQuestionIds(plan);

  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.narrow}>
      <PageHeader
        title={plan.title}
        subtitle={plan.subtitle}
        action={
          started ? (
            <Button color="inherit" onClick={() => dispatch(leavePlan(plan.id))}>
              Leave plan
            </Button>
          ) : (
            <Button variant="contained" onClick={() => dispatch(startPlan(plan.id))}>
              Start plan
            </Button>
          )
        }
      />
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography sx={{ mb: 2 }}>{plan.description}</Typography>
        <PlanStats plan={plan} detailed />
        <ProgressSummary done={countCompleted(ids, completed)} total={ids.length} />
      </Card>
      {plan.sections.map((s) => {
        const questions = getQuestions(s.questions);
        return (
          <Box key={s.title} sx={{ mb: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6" fontWeight={700}>
                {s.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {countCompleted(
                  questions.map((q) => q.id),
                  completed
                )}
                /{questions.length}
              </Typography>
            </Stack>
            {s.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {s.description}
              </Typography>
            )}
            <QuestionList questions={questions} numbered />
          </Box>
        );
      })}
    </Page>
  );
}
