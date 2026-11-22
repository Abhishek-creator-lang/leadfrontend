'use client';

import { useActionState } from 'react';
import { Stack } from '@mui/material';
import { acceptInviteAction, resetPasswordAction } from '@/app/(auth)/actions';
import {
  FormAlert,
  FormField,
  PasswordField,
  SubmitButton,
  TermsCheckbox,
} from '@/components/auth/FormParts';
import { initialActionState } from '@/lib/actionState';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/auth';

/**
 * Choose-a-password form behind an emailed link: `reset` (forgot password) or `invite`
 * (admin-created account, which also asks for the user's name).
 */
export function SetPasswordForm({
  mode,
  token,
  defaultName,
}: {
  mode: 'reset' | 'invite';
  token: string;
  defaultName?: string;
}) {
  const [state, action] = useActionState(
    mode === 'invite' ? acceptInviteAction : resetPasswordAction,
    initialActionState
  );
  return (
    <form action={action} noValidate>
      <Stack spacing={2}>
        <FormAlert state={state} />
        <input type="hidden" name="token" value={token} />
        {mode === 'invite' && (
          <FormField
            name="name"
            state={state}
            label="Full name"
            autoComplete="name"
            defaultValue={state.values?.name ?? defaultName}
            required
          />
        )}
        <PasswordField
          name="password"
          state={state}
          label="New password"
          autoComplete="new-password"
          helperText={`At least ${PASSWORD_MIN_LENGTH} characters`}
          autoFocus
          required
        />
        <PasswordField
          name="confirmPassword"
          state={state}
          label="Confirm new password"
          autoComplete="new-password"
          required
        />
        {mode === 'invite' && <TermsCheckbox state={state} />}
        <SubmitButton>{mode === 'invite' ? 'Activate account' : 'Set new password'}</SubmitButton>
      </Stack>
    </form>
  );
}
