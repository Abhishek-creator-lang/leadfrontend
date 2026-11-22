'use client';

import { useMemo } from 'react';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { NamedIcon } from '@/components/icons';
import { LinkCard } from '@/components/LinkCard';
import { ProgressRing } from '@/components/ProgressRing';
import { ProgressSummary } from '@/components/ProgressSummary';
import { QuestionList } from '@/components/QuestionList';
import { Section, ViewAllButton } from '@/components/Section';
import { StatCard } from '@/components/StatCard';
import { SupportCard } from '@/components/support/SupportCard';
import { DEFAULT_PLAN_ID } from '@/constants/app';
import { useContent } from '@/context/ContentContext';
import { useModeColors } from '@/hooks/useModeColors';
import { FORMAT_INFO, FORMAT_ORDER } from '@/content/formats';
import { Page, PageHeader } from '@/layout/Page';
import { PATHS, focusAreaPath, formatPath, guidePath, studyPlanPath } from '@/routes/paths';
import { useAppSelector } from '@/store';
import { currentStreak } from '@/store/progressSlice';
import { pluralize } from '@/utils/format';
import { countCompleted, planQuestionIds } from '@/utils/progress';

const RECENT_LIMIT = 5;
const RECOMMENDED_LIMIT = 5;

export default function DashboardPage() {
  const { content, getQuestions, getStudyPlan, questionsByFormat } = useContent();
  const mc = useModeColors();
  const progress = useAppSelector((s) => s.progress);
  const { completed } = progress;
  const allIds = useMemo(() => content.questions.map((q) => q.id), [content.questions]);
  const streak = currentStreak(progress.activity);

  const byFormat = useMemo(
    () =>
      FORMAT_ORDER.map((format) => {
        const ids = questionsByFormat(format).map((q) => q.id);
        return { format, total: ids.length, done: countCompleted(ids, completed) };
      }),
    [completed, questionsByFormat]
  );

  const recent = getQuestions(progress.recent).slice(0, RECENT_LIMIT);

  const recommended = useMemo(() => {
    const plan = getStudyPlan(DEFAULT_PLAN_ID) ?? content.studyPlans[0];
    const ids = plan ? planQuestionIds(plan) : allIds;
    return getQuestions(ids.filter((id) => !completed[id])).slice(0, RECOMMENDED_LIMIT);
  }, [completed, allIds, content.studyPlans, getQuestions, getStudyPlan]);

  return (
    <Page>
      {/* Cream gradient panel around the greeting and stats (reference: learner programs section). */}
      <Box
        sx={{
          mb: 5,
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          backgroundImage: mc.gradient.goldPanel,
          '& > :first-of-type': { mt: 0 },
        }}
      >
        <PageHeader
          title="Interview dashboard"
          subtitle="Prepare for senior and lead front end roles: coding, React, system design, and leadership."
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<TaskAltRoundedIcon color="success" />}
              label="Questions completed"
              value={`${countCompleted(allIds, completed)} / ${allIds.length}`}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<LocalFireDepartmentRoundedIcon color="secondary" />}
              label="Current streak"
              value={pluralize(streak, 'day')}
              hint="Complete one question a day to keep it going"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<NamedIcon name="book" color="primary" />}
              label="Study plans in progress"
              value={Object.keys(progress.startedPlans).length}
              hint="Pick a plan that matches your timeline"
            />
          </Grid>
        </Grid>
      </Box>

      <Section
        title="Progress by question format"
        action={<ViewAllButton href={PATHS.questions}>All questions</ViewAllButton>}
      >
        <Grid container spacing={2}>
          {byFormat.map(({ format, total, done }) => (
            <Grid item xs={12} sm={6} md={4} key={format}>
              <LinkCard href={formatPath(format)}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ProgressRing value={done} total={total} format={format} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600}>{FORMAT_INFO[format].label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {done} / {total} completed
                    </Typography>
                  </Box>
                </Stack>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      {recent.length > 0 && (
        <Section title="Continue where you left off">
          <QuestionList questions={recent} />
        </Section>
      )}

      <Section
        title="Recommended next"
        action={
          <ViewAllButton href={studyPlanPath(DEFAULT_PLAN_ID)}>
            {getStudyPlan(DEFAULT_PLAN_ID)?.title ?? 'Lead 75'}
          </ViewAllButton>
        }
      >
        <QuestionList questions={recommended} />
      </Section>

      <Section title="Study plans" action={<ViewAllButton href={PATHS.studyPlans} />}>
        <Grid container spacing={2}>
          {content.studyPlans.map((p) => {
            const ids = planQuestionIds(p);
            return (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <LinkCard href={studyPlanPath(p.id)} stack>
                  <Typography fontWeight={600}>{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    {p.subtitle}
                  </Typography>
                  <ProgressSummary
                    done={countCompleted(ids, completed)}
                    total={ids.length}
                    unit="questions"
                  />
                </LinkCard>
              </Grid>
            );
          })}
        </Grid>
      </Section>

      <Section title="Focus areas" action={<ViewAllButton href={PATHS.focusAreas} />}>
        <Grid container spacing={2}>
          {content.focusAreas.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.id}>
              <LinkCard href={focusAreaPath(f.id)} padding={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <NamedIcon name={f.icon} color="primary" />
                  <Box>
                    <Typography fontWeight={600} fontSize={14}>
                      {f.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {countCompleted(f.questions, completed)} / {f.questions.length}
                    </Typography>
                  </Box>
                </Stack>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      <SupportCard />

      <Section title="Activity">
        <Card sx={{ p: 2.5 }}>
          <ActivityHeatmap activity={progress.activity} />
        </Card>
      </Section>

      <Section title="Guides & playbooks" action={<ViewAllButton href={PATHS.guides} />}>
        <Grid container spacing={2}>
          {content.guides.map((g) => (
            <Grid item xs={12} sm={6} md={4} key={g.id}>
              <LinkCard href={guidePath(g.id, g.chapters[0]?.slug)}>
                <NamedIcon name={g.icon} color="primary" />
                <Typography fontWeight={600} sx={{ mt: 1 }}>
                  {g.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pluralize(g.chapters.length, 'chapter')}
                </Typography>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      </Section>
    </Page>
  );
}
