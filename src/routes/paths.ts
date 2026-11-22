import type { Format, QuestionMeta } from '@/content/types';

export const PATHS = {
  home: '/',
  dashboard: '/dashboard',
  questions: '/questions',
  studyPlans: '/study-plans',
  focusAreas: '/focus-areas',
  guides: '/guides',
  companies: '/companies',
  bookmarks: '/bookmarks',
  settings: '/settings',
  support: '/support',

  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  acceptInvite: '/accept-invite',
  account: '/account',
  forbidden: '/forbidden',

  admin: '/admin',
  adminUsers: '/admin/users',
  adminNewUser: '/admin/users/new',
  adminSupport: '/admin/support',
} as const;

export const questionPath = (q: Pick<QuestionMeta, 'format' | 'slug'>) =>
  `${PATHS.questions}/${q.format}/${q.slug}`;
export const formatPath = (format: Format) => `${PATHS.questions}/${format}`;
export const studyPlanPath = (id: string) => `${PATHS.studyPlans}/${id}`;
export const focusAreaPath = (id: string) => `${PATHS.focusAreas}/${id}`;
export const guidePath = (guide: string, chapter?: string) =>
  `${PATHS.guides}/${guide}${chapter ? `/${chapter}` : ''}`;
export const companyPath = (slug: string) => `${PATHS.companies}/${slug}`;
export const adminUserPath = (id: string) => `${PATHS.adminUsers}/${id}`;

/** Path with a one-off token query param, as used in email links. */
export const tokenPath = (path: string, token: string) =>
  `${path}?token=${encodeURIComponent(token)}`;

/**
 * Only same-origin, absolute paths are allowed as post-login redirects (blocks `//evil.com`,
 * `https://…` and `/\evil.com` open redirects).
 */
export function safeNextPath(next: unknown, fallback: string = PATHS.dashboard): string {
  if (
    typeof next !== 'string' ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    next.startsWith('/\\')
  ) {
    return fallback;
  }
  return next;
}

export const loginPath = (next?: string) =>
  next ? `${PATHS.login}?next=${encodeURIComponent(safeNextPath(next))}` : PATHS.login;

/** True when `pathname` is a single question's workspace (`/questions/:format/:slug`). */
export const isQuestionWorkspacePath = (pathname: string) =>
  /^\/questions\/[^/]+\/[^/]+/.test(pathname);

/** Pages that render without the app shell's sidebar (auth screens). */
export const isAuthPath = (pathname: string) =>
  [
    PATHS.login,
    PATHS.register,
    PATHS.verifyEmail,
    PATHS.forgotPassword,
    PATHS.resetPassword,
    PATHS.acceptInvite,
  ].some((p) => pathname === p);
