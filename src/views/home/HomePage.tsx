'use client';

import { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { NamedIcon } from '@/components/icons';
import { LinkCard } from '@/components/LinkCard';
import { LinkButton } from '@/components/links';
import { QuestionList } from '@/components/QuestionList';
import { Section, ViewAllButton } from '@/components/Section';
import { useContent } from '@/context/ContentContext';
import { FORMAT_INFO, FORMAT_ORDER } from '@/content/formats';
import { HOME_FAQ } from '@/content/homeFaq';
import { useModeColors } from '@/hooks/useModeColors';
import { Page } from '@/layout/Page';
import { PATHS, companyPath, formatPath, guidePath, studyPlanPath } from '@/routes/paths';

const POPULAR_LIMIT = 8;

/**
 * Public landing page: the URL that should rank for "front end interview questions". Everything
 * here is a real link, rendered on the server, so crawlers reach every section of the site.
 */
export default function HomePage({ signedIn }: { signedIn: boolean }) {
  const { content, questionsByFormat, FORMAT_COUNTS } = useContent();
  const mc = useModeColors();
  const total = content.questions.length;

  // High-importance questions, interleaved across formats so the list shows the range.
  const popular = useMemo(() => {
    const lists = FORMAT_ORDER.map((f) =>
      questionsByFormat(f).filter((q) => q.importance === 'high')
    );
    const out = [];
    for (let i = 0; out.length < POPULAR_LIMIT && lists.some((l) => l[i]); i++) {
      for (const l of lists) if (l[i] && out.length < POPULAR_LIMIT) out.push(l[i]);
    }
    return out;
  }, [questionsByFormat]);

  return (
    <Page>
      <Box
        component="header"
        sx={{
          mb: 5,
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          backgroundImage: mc.gradient.goldPanel,
        }}
      >
        <Typography variant="h3" component="h1" sx={{ maxWidth: 820 }}>
          Front end interview questions & prep for senior and lead engineers
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 760, fontSize: 17 }}>
          Practice {total}+ front end interview questions with worked solutions: JavaScript
          functions, React UI coding, algorithms, quizzes, front end system design and behavioral
          rounds. Code and run tests in the browser, follow a study plan, and read how top companies
          interview.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
          <LinkButton href={PATHS.questions} variant="contained" size="large">
            Start practicing
          </LinkButton>
          <LinkButton
            href={signedIn ? PATHS.dashboard : PATHS.studyPlans}
            variant="outlined"
            size="large"
          >
            {signedIn ? 'Go to your dashboard' : 'Browse study plans'}
          </LinkButton>
        </Stack>
      </Box>

      <Section
        title="Question formats"
        action={<ViewAllButton href={PATHS.questions}>All questions</ViewAllButton>}
      >
        <Grid container spacing={2}>
          {FORMAT_ORDER.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f}>
              <LinkCard href={formatPath(f)}>
                <Typography variant="h6" component="h3">
                  {FORMAT_INFO[f].label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {FORMAT_INFO[f].description}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {FORMAT_COUNTS[f]} questions
                </Typography>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section title="Popular interview questions">
        <QuestionList questions={popular} />
      </Section>

      <Section title="Study plans" action={<ViewAllButton href={PATHS.studyPlans} />}>
        <Grid container spacing={2}>
          {content.studyPlans.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <LinkCard href={studyPlanPath(p.id)}>
                <Typography variant="h6" component="h3">
                  {p.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {p.subtitle}
                </Typography>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section title="Guides & playbooks" action={<ViewAllButton href={PATHS.guides} />}>
        <Grid container spacing={2}>
          {content.guides.map((g) => (
            <Grid item xs={12} sm={6} md={4} key={g.id}>
              <LinkCard href={guidePath(g.id, g.chapters[0]?.slug)}>
                <NamedIcon name={g.icon} color="primary" />
                <Typography variant="h6" component="h3" sx={{ mt: 1 }}>
                  {g.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {g.description}
                </Typography>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section title="Company interview guides" action={<ViewAllButton href={PATHS.companies} />}>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
          {content.companies.map((c) => (
            <LinkButton
              key={c.slug}
              href={companyPath(c.slug)}
              variant="outlined"
              size="small"
              color="inherit"
            >
              {c.name}
            </LinkButton>
          ))}
        </Stack>
      </Section>

      <Section title="Frequently asked questions">
        <Box>
          {HOME_FAQ.map(({ q, a }) => (
            <Accordion key={q} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography component="h3" fontWeight={600}>
                  {q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Section>
    </Page>
  );
}
