import type { Metadata } from 'next';
import { Card } from '@mui/material';
import { assignableRoles } from '@/constants/roles';
import { PageHeader } from '@/layout/Page';
import { requireAdmin } from '@/server/auth/dal';
import { CreateUserForm } from '@/views/admin/CreateUserForm';

export const metadata: Metadata = { title: 'Add user' };

export default async function NewUserPage() {
  const actor = await requireAdmin();
  return (
    <>
      <PageHeader
        title="Add user"
        subtitle={
          actor.role === 'super_admin'
            ? 'Create a learner or another admin.'
            : 'Create a learner account. Only the super admin can add admins.'
        }
      />
      <Card sx={{ p: 3, maxWidth: 560 }}>
        <CreateUserForm roles={assignableRoles(actor.role)} />
      </Card>
    </>
  );
}
