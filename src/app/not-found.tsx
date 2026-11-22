import type { Metadata } from 'next';
import { Stack } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { LinkButton } from '@/components/links';
import { PATHS } from '@/routes/paths';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

/** A real 404 (status and page), with a way back into the content. */
export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="This page doesn't exist or has moved."
      action={
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <LinkButton href={PATHS.questions} variant="contained">
            Browse questions
          </LinkButton>
          <LinkButton href={PATHS.home} variant="outlined">
            Home
          </LinkButton>
        </Stack>
      }
    />
  );
}
