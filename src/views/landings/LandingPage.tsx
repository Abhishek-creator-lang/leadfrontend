'use client';

import { Box, Stack, Typography } from '@mui/material';
import { TextLink } from '@/components/links';
import { EmptyState } from '@/components/EmptyState';
import { QuestionList } from '@/components/QuestionList';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { getLanding, LANDINGS, landingQuestions } from '@/content/landings';
import { useContent } from '@/context/ContentContext';
import { Page, PageHeader } from '@/layout/Page';
import { PATHS, landingPath } from '@/routes/paths';

/** One search landing page: intro, how to prepare, the questions, then links to the other landings. */
export default function LandingPage({ slug }: { slug: string }) {
  const { content } = useContent();
  const landing = getLanding(slug);
  if (!landing) return <EmptyState title="Page not found" />;
  const questions = landingQuestions(landing, content.questions);

  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.narrow}>
      <PageHeader title={landing.heading} subtitle={`${questions.length} questions with answers`} />
      <Typography sx={{ mb: 3 }}>{landing.intro}</Typography>

      <Typography variant="h6" component="h2" gutterBottom>
        How to prepare
      </Typography>
      <Box component="ul" sx={{ mt: 0, mb: 4, pl: 2.5 }}>
        {landing.prepare.map((p) => (
          <Typography component="li" key={p} sx={{ mb: 0.5 }}>
            {p}
          </Typography>
        ))}
      </Box>

      <Typography variant="h6" component="h2" gutterBottom>
        {landing.heading}
      </Typography>
      <QuestionList questions={questions} numbered />

      <Box component="nav" aria-label="More interview questions" sx={{ mt: 5 }}>
        <Typography variant="subtitle2" component="h2" gutterBottom>
          More interview questions
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2}>
          {LANDINGS.filter((l) => l.slug !== slug).map((l) => (
            <TextLink key={l.slug} href={landingPath(l.slug)} variant="body2">
              {l.heading}
            </TextLink>
          ))}
          <TextLink href={PATHS.focusAreas} variant="body2">
            Questions by topic
          </TextLink>
        </Stack>
      </Box>
    </Page>
  );
}
