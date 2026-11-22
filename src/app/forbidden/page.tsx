import type { Metadata } from 'next';
import { LinkButton } from '@/components/links';

import { EmptyState } from '@/components/EmptyState';
import { PATHS } from '@/routes/paths';

export const metadata: Metadata = { title: 'Access denied' };

export default function ForbiddenPage() {
  return (
    <EmptyState
      title="You do not have access to this page"
      description="It is only available to administrators."
      action={
        <LinkButton href={PATHS.dashboard} variant="contained">
          Back to dashboard
        </LinkButton>
      }
    />
  );
}
