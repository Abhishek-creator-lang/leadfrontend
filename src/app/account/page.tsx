import type { Metadata } from 'next';
import { Chip } from '@mui/material';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { ROLE_LABEL } from '@/constants/roles';
import { Page, PageHeader } from '@/layout/Page';
import { PATHS } from '@/routes/paths';
import { requireUser } from '@/server/auth/dal';
import { ChangePasswordForm, ProfileForm, SessionsCard } from '@/views/account/AccountForms';

export const metadata: Metadata = { title: 'Account' };

export default async function AccountPage() {
  const user = await requireUser(PATHS.account);
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.form}>
      <PageHeader
        title="Account"
        subtitle={user.email}
        action={<Chip label={ROLE_LABEL[user.role]} color="primary" variant="outlined" />}
      />
      <ProfileForm name={user.name} email={user.email} />
      <ChangePasswordForm />
      <SessionsCard />
    </Page>
  );
}
