'use client';

import { useActionState } from 'react';
import { Stack } from '@mui/material';
import { forgotPasswordAction } from '@/app/(auth)/actions';
import { FormAlert, FormField, SubmitButton } from '@/components/auth/FormParts';
import { initialActionState } from '@/lib/actionState';

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialActionState);
  if (state.ok) return <FormAlert state={state} />;
  return (
    <form action={action} noValidate>
      <Stack spacing={2}>
        <FormAlert state={state} />
        <FormField
          name="email"
          state={state}
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          required
        />
        <SubmitButton>Send reset link</SubmitButton>
      </Stack>
    </form>
  );
}
