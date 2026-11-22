import 'server-only';
import type { Role, UserStatus } from '@/constants/roles';
import { db } from '../db';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  role: Role;
  status: UserStatus;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  /** When the Terms of Use and Privacy Policy were accepted. */
  terms_accepted_at: Date | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

/** A user without credentials, safe to render. */
export type UserRecord = Omit<UserRow, 'password_hash'>;

const PUBLIC_COLUMNS = [
  'id',
  'email',
  'name',
  'role',
  'status',
  'email_verified_at',
  'last_login_at',
  'created_by',
  'created_at',
  'updated_at',
] as const;

/** Postgres unique_violation (e.g. registering an email that already exists). */
export const isUniqueViolation = (err: unknown) =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';

export const findUserByEmail = (email: string) =>
  db<UserRow>('users').whereRaw('lower(email) = lower(?)', [email]).first();

export const findUserById = (id: string) => db<UserRow>('users').where({ id }).first();

export const findUserRecordById = (id: string) =>
  db<UserRow>('users').where({ id }).first<UserRecord | undefined>(PUBLIC_COLUMNS);

export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  passwordHash?: string | null;
  createdBy?: string | null;
  termsAccepted?: boolean;
}): Promise<UserRow> {
  const [row] = await db<UserRow>('users')
    .insert({
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      status: input.status,
      password_hash: input.passwordHash ?? null,
      created_by: input.createdBy ?? null,
      terms_accepted_at: input.termsAccepted ? db.fn.now() : null,
    })
    .returning('*');
  return row;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<UserRow, 'name' | 'role' | 'status' | 'password_hash' | 'email_verified_at'>>
) {
  await db('users')
    .where({ id })
    .update({ ...patch, updated_at: db.fn.now() });
}

/** Marks the email as verified and the account active (verify link / accepted invite). */
export const activateUser = (
  id: string,
  {
    termsAccepted,
    ...extra
  }: { name?: string; password_hash?: string; termsAccepted?: boolean } = {}
) =>
  db('users')
    .where({ id })
    .update({
      ...extra,
      ...(termsAccepted ? { terms_accepted_at: db.fn.now() } : {}),
      status: 'active',
      email_verified_at: db.raw('coalesce(email_verified_at, now())'),
      updated_at: db.fn.now(),
    });

export const deleteUser = (id: string) => db('users').where({ id }).delete();

export interface UserListQuery {
  search?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

export async function listUsers({ search, role, status, page = 1, pageSize = 20 }: UserListQuery) {
  const base = db<UserRow>('users').modify((q) => {
    if (search) {
      const like = `%${search.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
      q.where((w) => w.whereILike('email', like).orWhereILike('name', like));
    }
    if (role) q.where({ role });
    if (status) q.where({ status });
  });

  const [{ count }] = await base.clone().count<{ count: string }[]>({ count: '*' });
  const rows = await base
    .clone()
    .select<UserRecord[]>(PUBLIC_COLUMNS)
    // Super admin first, then admins, then newest learners.
    .orderByRaw("case role when 'super_admin' then 0 when 'admin' then 1 else 2 end")
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset((Math.max(page, 1) - 1) * pageSize);

  return { rows, total: Number(count), page, pageSize };
}

export interface UserStats {
  byRole: Record<Role, number>;
  byStatus: Record<UserStatus, number>;
  signups7d: number;
  signups30d: number;
}

export async function userStats(): Promise<UserStats> {
  const [roles, statuses, [signups]] = await Promise.all([
    db('users')
      .select('role')
      .count<{ role: Role; count: string }[]>({ count: '*' })
      .groupBy('role'),
    db('users')
      .select('status')
      .count<{ status: UserStatus; count: string }[]>({ count: '*' })
      .groupBy('status'),
    db('users').select<{ d7: string; d30: string }[]>(
      db.raw("count(*) filter (where created_at > now() - interval '7 days') as d7"),
      db.raw("count(*) filter (where created_at > now() - interval '30 days') as d30")
    ),
  ]);
  const byRole = { super_admin: 0, admin: 0, learner: 0 } as Record<Role, number>;
  roles.forEach((r) => (byRole[r.role] = Number(r.count)));
  const byStatus = { pending: 0, active: 0, inactive: 0 } as Record<UserStatus, number>;
  statuses.forEach((s) => (byStatus[s.status] = Number(s.count)));
  return { byRole, byStatus, signups7d: Number(signups.d7), signups30d: Number(signups.d30) };
}
