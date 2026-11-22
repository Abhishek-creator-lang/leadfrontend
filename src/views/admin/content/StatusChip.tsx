import { Chip } from '@mui/material';
import type { EntryStatus } from '@/server/repositories/content';
import { STATUS_INFO } from './contentTypes';

export function ContentStatusChip({ status }: { status: EntryStatus }) {
  const info = STATUS_INFO[status];
  return (
    <Chip
      size="small"
      label={info.label}
      color={info.color}
      variant={status === 'archived' ? 'outlined' : 'filled'}
    />
  );
}
