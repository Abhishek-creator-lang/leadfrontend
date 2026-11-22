'use client';

import NextLink from 'next/link';
import {
  Card,
  Link,
  Pagination,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import type { Role, UserStatus } from '@/constants/roles';
import { adminUserPath } from '@/routes/paths';
import { RoleChip, StatusChip } from './UserChips';

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  /** Pre-formatted on the server so server and browser time zones can't disagree. */
  joined: string;
  lastLogin: string;
}

export function UsersTable({
  rows,
  total,
  page,
  pageSize,
  pageHref,
}: {
  rows: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  /** Query string for a given page, keeping the current filters. */
  pageHref: Record<number, string>;
}) {
  if (!rows.length)
    return <EmptyState title="No users found" description="Try a different search or filter." />;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Joined</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Last login</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Link
                    component={NextLink}
                    href={adminUserPath(u.id)}
                    fontWeight={600}
                    underline="hover"
                  >
                    {u.name}
                  </Link>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <RoleChip role={u.role} />
                </TableCell>
                <TableCell>
                  <StatusChip status={u.status} />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{u.joined}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {u.lastLogin}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.5 }}
      >
        <Typography variant="body2" color="text.secondary">
          {total} user{total === 1 ? '' : 's'}
        </Typography>
        {pages > 1 && (
          <Pagination
            page={page}
            count={pages}
            size="small"
            renderItem={(item) => (
              <PaginationItem
                component={NextLink}
                href={pageHref[item.page ?? 1] ?? '#'}
                {...item}
              />
            )}
          />
        )}
      </Stack>
    </Card>
  );
}
