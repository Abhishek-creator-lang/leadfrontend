import type { Metadata } from 'next';
import { Card, Grid, Stack, Typography } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { assignableRoles, canManageUser } from '@/constants/roles';
import { PageHeader } from '@/layout/Page';
import { requireAdmin } from '@/server/auth/dal';
import { loadUserProgress } from '@/server/repositories/progress';
import { findUserById } from '@/server/repositories/users';
import type { PageProps } from '@/types/next';
import { formatDateTime } from '@/utils/date';
import { LearnerProgress } from '@/views/admin/LearnerProgress';
import { UserActions } from '@/views/admin/UserActions';
import { RoleChip, StatusChip } from '@/views/admin/UserChips';

type Params = { id: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findUser(id: string) {
  return UUID.test(id) ? findUserById(id) : undefined;
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const user = await findUser((await params).id);
  return { title: user?.name ?? 'User not found' };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

export default async function AdminUserPage({ params }: PageProps<Params>) {
  const actor = await requireAdmin();
  const user = await findUser((await params).id);
  if (!user) return <EmptyState title="User not found" description="It may have been deleted." />;

  const manageable = canManageUser(actor, user);

  return (
    <>
      <PageHeader
        title={user.name}
        subtitle={user.email}
        action={
          <Stack direction="row" spacing={1}>
            <RoleChip role={user.role} />
            <StatusChip status={user.status} />
          </Stack>
        }
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid item xs={12} md={manageable ? 5 : 12}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography fontWeight={600} sx={{ mb: 2 }}>
              Details
            </Typography>
            <Stack spacing={1}>
              <Detail label="Joined" value={formatDateTime(user.created_at)} />
              <Detail label="Email confirmed" value={formatDateTime(user.email_verified_at)} />
              <Detail label="Last login" value={formatDateTime(user.last_login_at)} />
              <Detail
                label="Password set"
                value={user.password_hash ? 'Yes' : 'No (invitation pending)'}
              />
            </Stack>
          </Card>
        </Grid>
        {manageable && (
          <Grid item xs={12} md={7}>
            <UserActions
              userId={user.id}
              name={user.name}
              role={user.role}
              status={user.status}
              hasPassword={!!user.password_hash}
              assignable={assignableRoles(actor.role)}
            />
          </Grid>
        )}
      </Grid>

      {user.role === 'learner' ? (
        <LearnerProgress progress={await loadUserProgress(user.id)} />
      ) : (
        <Typography color="text.secondary">
          Progress tracking is shown for learners only.
        </Typography>
      )}
    </>
  );
}
