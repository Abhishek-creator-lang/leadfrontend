'use client';

import { useRef } from 'react';
import { Button, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ROLE_LABEL, ROLES, STATUS_LABEL, USER_STATUSES } from '@/constants/roles';

/** Search + role/status filters as a plain GET form, so filters live in the URL. */
export function UserFilters({ q, role, status }: { q?: string; role?: string; status?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} method="get">
      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        <TextField
          name="q"
          size="small"
          placeholder="Search name or email…"
          defaultValue={q}
          sx={{ flex: '1 1 240px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          name="role"
          size="small"
          label="Role"
          defaultValue={role ?? ''}
          onChange={() => setTimeout(submit)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All roles</MenuItem>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {ROLE_LABEL[r]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          name="status"
          size="small"
          label="Status"
          defaultValue={status ?? ''}
          onChange={() => setTimeout(submit)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {USER_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="outlined">
          Search
        </Button>
      </Stack>
    </form>
  );
}
