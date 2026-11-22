'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, Card, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  changeRoleAction,
  deleteUserAction,
  sendAccessEmailAction,
  setUserStatusAction,
} from '@/app/admin/actions';
import { ROLE_LABEL, type Role, type UserStatus } from '@/constants/roles';
import type { ActionState } from '@/lib/actionState';

/** Account management buttons on the admin user page. Rendered only when the admin may manage the user. */
export function UserActions({
  userId,
  name,
  role,
  status,
  hasPassword,
  assignable,
}: {
  userId: string;
  name: string;
  role: Role;
  status: UserStatus;
  hasPassword: boolean;
  assignable: Role[];
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState | null>(null);

  const run = (fn: () => Promise<ActionState>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => setResult(await fn()));
  };

  const emailLabel = !hasPassword
    ? 'Resend invitation'
    : status === 'pending'
      ? 'Resend confirmation email'
      : 'Send password reset link';

  return (
    <Card sx={{ p: 3 }}>
      <Typography fontWeight={600} sx={{ mb: 2 }}>
        Manage account
      </Typography>
      <Stack spacing={2}>
        {result?.errors?.form && <Alert severity="error">{result.errors.form}</Alert>}
        {result?.ok && <Alert severity="success">{result.message}</Alert>}

        {assignable.length > 1 && (
          <TextField
            select
            size="small"
            label="Role"
            value={role}
            disabled={pending}
            onChange={(e) => run(() => changeRoleAction(userId, e.target.value as Role))}
            sx={{ maxWidth: 220 }}
          >
            {assignable.map((r) => (
              <MenuItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {status !== 'inactive' && (
            <Button
              variant="outlined"
              disabled={pending}
              onClick={() => run(() => sendAccessEmailAction(userId))}
            >
              {emailLabel}
            </Button>
          )}
          {status === 'inactive' ? (
            <Button
              variant="outlined"
              color="success"
              disabled={pending}
              onClick={() => run(() => setUserStatusAction(userId, 'active'))}
            >
              Activate
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="warning"
              disabled={pending}
              onClick={() =>
                run(
                  () => setUserStatusAction(userId, 'inactive'),
                  `Deactivate ${name}? They will be signed out and unable to sign in.`
                )
              }
            >
              Deactivate
            </Button>
          )}
          <Button
            color="error"
            disabled={pending}
            onClick={() =>
              run(
                () => deleteUserAction(userId),
                `Permanently delete ${name} and all of their progress? This cannot be undone.`
              )
            }
          >
            Delete user
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
