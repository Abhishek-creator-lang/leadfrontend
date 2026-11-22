'use client';

import { useActionState } from 'react';
import { Alert, MenuItem, Stack } from '@mui/material';
import { createUserAction } from '@/app/admin/actions';
import { FormAlert, FormField, SubmitButton } from '@/components/auth/FormParts';
import { ROLE_LABEL, type Role } from '@/constants/roles';
import { initialActionState } from '@/lib/actionState';

/** Admin creates an account; the user receives an invite link and chooses their own password. */
export function CreateUserForm({ roles }: { roles: Role[] }) {
  const [state, action] = useActionState(createUserAction, initialActionState);
  return (
    <form action={action} noValidate>
      <Stack spacing={2}>
        <Alert severity="info">
          The user gets an email invitation to set their own password. The link is valid for 3 days.
        </Alert>
        <FormAlert state={state} />
        <FormField name="name" state={state} label="Full name" required autoFocus />
        <FormField name="email" state={state} label="Email" type="email" required />
        <FormField
          name="role"
          state={state}
          label="Role"
          select
          defaultValue={state.values?.role || roles[roles.length - 1]}
          disabled={roles.length === 1}
        >
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {ROLE_LABEL[r]}
            </MenuItem>
          ))}
        </FormField>
        {roles.length === 1 && <input type="hidden" name="role" value={roles[0]} />}
        <SubmitButton fullWidth={false} sx={{ alignSelf: 'flex-start' }}>
          Create and send invite
        </SubmitButton>
      </Stack>
    </form>
  );
}
