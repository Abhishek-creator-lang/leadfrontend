'use client';

import { Grid, Typography } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { LinkCard } from '@/components/LinkCard';
import { PAGE_TITLES } from '@/constants/navigation';
import { content } from '@/content';
import { Page, PageHeader } from '@/layout/Page';
import { companyPath } from '@/routes/paths';

export default function CompaniesPage() {
  return (
    <Page>
      <PageHeader
        title={PAGE_TITLES.companies}
        subtitle="What each company's front end loop looks like and which questions they tend to ask."
      />
      {content.companies.length === 0 ? (
        <EmptyState title="No company guides yet" />
      ) : (
        <Grid container spacing={1.5}>
          {content.companies.map((c) => (
            <Grid item xs={6} sm={4} md={3} key={c.slug}>
              <LinkCard href={companyPath(c.slug)} padding={2}>
                <Typography fontWeight={700}>{c.name}</Typography>
              </LinkCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Page>
  );
}
