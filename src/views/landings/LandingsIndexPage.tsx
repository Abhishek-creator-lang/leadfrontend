'use client';

import { Grid, Typography } from '@mui/material';
import { LinkCard } from '@/components/LinkCard';
import { LANDINGS, landingQuestions } from '@/content/landings';
import { useContent } from '@/context/ContentContext';
import { Page, PageHeader } from '@/layout/Page';
import { landingPath } from '@/routes/paths';

export default function LandingsIndexPage() {
  const { content } = useContent();
  return (
    <Page>
      <PageHeader
        title="Frontend Interview Questions"
        subtitle="Interview questions with answers, grouped the way interviews are: by technology and by level."
      />
      <Grid container spacing={2}>
        {LANDINGS.map((l) => (
          <Grid item xs={12} sm={6} md={4} key={l.slug}>
            <LinkCard href={landingPath(l.slug)} padding={3} stack>
              <Typography variant="h6">{l.heading}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {landingQuestions(l, content.questions).length} questions
              </Typography>
            </LinkCard>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}
