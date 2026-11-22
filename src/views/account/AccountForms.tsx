'use client';

import { useActionState } from 'react';
import { Button, Card, Stack, Typography } from '@mui/material';
import { logoutAction } from '@/app/(auth)/actions';
import {
  changePasswordAction,
  logoutEverywhereAction,
  updateProfileAction,
} from '@/app/account/actions';
import { FormAlert, FormField, PasswordField, SubmitButton } from '@/components/auth/FormParts';
import { initialActionState } from '@/lib/actionState';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/auth';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ p: 3, mb: 2 }}>
      <Typography fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Card>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState(updateProfileAction, { values: { name } });
  return (
    <Section title="Profile">
      <form action={action} noValidate>
        <Stack spacing={2}>
          <FormAlert state={state} />
          <FormField name="email" state={initialActionState} label="Email" value={email} disabled />
          <FormField name="name" state={state} label="Full name" autoComplete="name" required />
          <SubmitButton fullWidth={false} size="medium" sx={{ alignSelf: 'flex-start' }}>
            Save
          </SubmitButton>
        </Stack>
      </form>
    </Section>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialActionState);
  return (
    <Section title="Change password">
      <form action={action} noValidate>
        <Stack spacing={2}>
          <FormAlert state={state} />
          <PasswordField
            name="currentPassword"
            state={state}
            label="Current password"
            autoComplete="current-password"
            required
          />
          <PasswordField
            name="password"
            state={state}
            label="New password"
            autoComplete="new-password"
            helperText={`At least ${PASSWORD_MIN_LENGTH} characters`}
            required
          />
          <PasswordField
            name="confirmPassword"
            state={state}
            label="Confirm new password"
            autoComplete="new-password"
            required
          />
          <SubmitButton fullWidth={false} size="medium" sx={{ alignSelf: 'flex-start' }}>
            Change password
          </SubmitButton>
        </Stack>
      </form>
    </Section>
  );
}

export function SessionsCard() {
  return (
    <Section title="Sessions">
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <form action={logoutAction}>
          <Button type="submit" variant="outlined">
            Log out
          </Button>
        </form>
        <form action={logoutEverywhereAction}>
          <Button type="submit" color="error">
            Log out of all devices
          </Button>
        </form>
      </Stack>
    </Section>
  );
}
