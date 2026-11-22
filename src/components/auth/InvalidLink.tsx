import { Alert, Stack } from '@mui/material';
import { AuthCard } from './AuthCard';
import { LinkButton } from '@/components/links';

/** Shown when an emailed link is unknown, expired or already used. */
export function InvalidLink({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <AuthCard title={title}>
      <Stack spacing={2}>
        <Alert severity="warning">{message}</Alert>
        <LinkButton href={actionHref} variant="contained" size="large" fullWidth>
          {actionLabel}
        </LinkButton>
      </Stack>
    </AuthCard>
  );
}
