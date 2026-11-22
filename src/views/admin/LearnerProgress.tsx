import { Box, Card, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { TextLink } from '@/components/links';
import { ProgressSummary } from '@/components/ProgressSummary';
import { Section } from '@/components/Section';
import { content, getQuestions, getStudyPlan, questionsByFormat } from '@/content';
import { FORMAT_INFO, FORMAT_ORDER } from '@/content/formats';
import { questionPath } from '@/routes/paths';
import type { ProgressState } from '@/store/progressSlice';
import { countCompleted, planQuestionIds } from '@/utils/progress';

const RECENT_LIMIT = 10;

/** Read-only view of a learner's progress for admins (server-rendered; nothing here mutates). */
export function LearnerProgress({ progress }: { progress: ProgressState }) {
  const { completed } = progress;
  const allIds = content.questions.map((q) => q.id);
  const recent = getQuestions(progress.recent).slice(0, RECENT_LIMIT);
  const plans = Object.keys(progress.startedPlans)
    .map(getStudyPlan)
    .filter((p) => p !== undefined);

  return (
    <>
      <Section title="Progress">
        <Card sx={{ p: 2.5, mb: 2 }}>
          <ProgressSummary
            label="All questions"
            done={countCompleted(allIds, completed)}
            total={allIds.length}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {Object.keys(progress.bookmarked).length} bookmarked ·{' '}
            {Object.keys(progress.notes).length} with notes · {Object.keys(progress.drafts).length}{' '}
            code drafts
          </Typography>
        </Card>
        <Grid container spacing={2}>
          {FORMAT_ORDER.map((format) => {
            const ids = questionsByFormat(format).map((q) => q.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={format}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Typography fontWeight={600} sx={{ mb: 1 }}>
                    {FORMAT_INFO[format].label}
                  </Typography>
                  <ProgressSummary done={countCompleted(ids, completed)} total={ids.length} />
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Section>

      <Section title="Activity">
        <Card sx={{ p: 2.5 }}>
          <ActivityHeatmap activity={progress.activity} />
        </Card>
      </Section>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Section title="Study plans">
            <Card>
              {plans.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  No study plan started.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ p: 2 }}>
                  {plans.map((plan) => {
                    const ids = planQuestionIds(plan);
                    return (
                      <Box key={plan.id}>
                        <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                          {plan.title}
                        </Typography>
                        <ProgressSummary done={countCompleted(ids, completed)} total={ids.length} />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Card>
          </Section>
        </Grid>
        <Grid item xs={12} md={6}>
          <Section title="Recently opened">
            <Card>
              {recent.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  Nothing opened yet.
                </Typography>
              ) : (
                <List dense>
                  {recent.map((q) => (
                    <ListItem key={q.id}>
                      <ListItemText
                        primary={
                          <TextLink href={questionPath(q)} color="inherit" underline="hover">
                            {q.title}
                          </TextLink>
                        }
                        secondary={`${FORMAT_INFO[q.format].short}${completed[q.id] ? ' · completed' : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>
          </Section>
        </Grid>
      </Grid>
    </>
  );
}
