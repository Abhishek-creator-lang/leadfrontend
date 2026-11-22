import { Chip, ChipProps } from '@mui/material';
import { ROLE_LABEL, STATUS_LABEL, type Role, type UserStatus } from '@/constants/roles';

const ROLE_COLOR: Record<Role, ChipProps['color']> = {
  super_admin: 'secondary',
  admin: 'primary',
  learner: 'default',
};

const STATUS_COLOR: Record<UserStatus, ChipProps['color']> = {
  active: 'success',
  pending: 'warning',
  inactive: 'default',
};

export const RoleChip = ({ role }: { role: Role }) => (
  <Chip size="small" label={ROLE_LABEL[role]} color={ROLE_COLOR[role]} variant="outlined" />
);

export const StatusChip = ({ status }: { status: UserStatus }) => (
  <Chip size="small" label={STATUS_LABEL[status]} color={STATUS_COLOR[status]} />
);
