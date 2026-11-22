export const ROLES = ['super_admin', 'admin', 'learner'] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ['pending', 'active', 'inactive'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  learner: 'Learner',
};

export const STATUS_LABEL: Record<UserStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
};

export const isAdminRole = (role?: Role | null) => role === 'admin' || role === 'super_admin';

/** Roles a given admin may assign when creating or editing users. */
export const assignableRoles = (actor: Role): Role[] =>
  actor === 'super_admin' ? ['admin', 'learner'] : actor === 'admin' ? ['learner'] : [];

/** The user shape that is safe to send to the client. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Whether `actor` may change or delete `target`. Enforced by the admin Server Actions and mirrored in
 * the UI: nobody touches the super admin or themselves, and admins only manage learners.
 */
export function canManageUser(
  actor: Pick<SessionUser, 'id' | 'role'>,
  target: { id: string; role: Role }
) {
  if (target.role === 'super_admin' || actor.id === target.id) return false;
  if (actor.role === 'super_admin') return true;
  return actor.role === 'admin' && target.role === 'learner';
}
