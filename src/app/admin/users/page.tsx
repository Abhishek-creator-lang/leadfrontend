import type { Metadata } from 'next';
import { LinkButton } from '@/components/links';

import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { ROLES, USER_STATUSES, type Role, type UserStatus } from '@/constants/roles';
import { PageHeader } from '@/layout/Page';
import { PATHS } from '@/routes/paths';
import { requireAdmin } from '@/server/auth/dal';
import { listUsers } from '@/server/repositories/users';
import { firstParam, type SearchParamsProps } from '@/types/next';
import { formatDate, formatDateTime } from '@/utils/date';
import { UserFilters } from '@/views/admin/UserFilters';
import { UsersTable } from '@/views/admin/UsersTable';

export const metadata: Metadata = { title: 'Users' };

const PAGE_SIZE = 20;

const oneOf = <T extends string>(options: readonly T[], value?: string) =>
  options.includes(value as T) ? (value as T) : undefined;

export default async function AdminUsersPage({ searchParams }: SearchParamsProps) {
  // Pages render in parallel with their layout, so each admin page checks access itself.
  await requireAdmin(PATHS.adminUsers);
  const params = await searchParams;
  const q = firstParam(params.q)?.trim() || undefined;
  const role = oneOf<Role>(ROLES, firstParam(params.role));
  const status = oneOf<UserStatus>(USER_STATUSES, firstParam(params.status));
  const page = Math.max(1, Number(firstParam(params.page)) || 1);

  const { rows, total } = await listUsers({ search: q, role, status, page, pageSize: PAGE_SIZE });

  const pageHref: Record<number, string> = {};
  for (let p = 1; p <= Math.ceil(total / PAGE_SIZE); p++) {
    const qs = new URLSearchParams({
      ...(q && { q }),
      ...(role && { role }),
      ...(status && { status }),
      page: String(p),
    });
    pageHref[p] = `${PATHS.adminUsers}?${qs}`;
  }

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Search, filter and manage every account."
        action={
          <LinkButton
            href={PATHS.adminNewUser}
            variant="contained"
            startIcon={<PersonAddAlt1RoundedIcon />}
          >
            Add user
          </LinkButton>
        }
      />
      <UserFilters q={q} role={role} status={status} />
      <UsersTable
        rows={rows.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          joined: formatDate(u.created_at),
          lastLogin: formatDateTime(u.last_login_at),
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        pageHref={pageHref}
      />
    </>
  );
}
