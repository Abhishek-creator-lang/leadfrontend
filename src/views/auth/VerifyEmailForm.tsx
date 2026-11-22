'use client';

import { useActionState } from 'react';
import { Stack } from '@mui/material';
import { verifyEmailAction } from '@/app/(auth)/actions';
import { FormAlert, SubmitButton } from '@/components/auth/FormParts';
import { initialActionState } from '@/lib/actionState';

/**
 * Confirmation happens on an explicit click (a POST), not on page load, so link scanners in mail
 * clients that prefetch URLs can't use up the token.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action] = useActionState(verifyEmailAction, initialActionState);
  return (
    <form action={action}>
      <Stack spacing={2}>
        <FormAlert state={state} />
        <input type="hidden" name="token" value={token} />
        <SubmitButton>Confirm my email</SubmitButton>
      </Stack>
    </form>
  );
}
