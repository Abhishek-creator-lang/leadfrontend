import { PATHS } from '@/routes/paths';

/** Titles shared by the sidebar, page headers and `<title>` metadata. */
export const PAGE_TITLES = {
  dashboard: 'Dashboard',
  questions: 'All questions',
  studyPlans: 'Study plans',
  focusAreas: 'Focus areas',
  guides: 'Guides & playbooks',
  companies: 'Company guides',
  mockInterview: 'Mock interview',
  bookmarks: 'Bookmarks',
  settings: 'Settings',
} as const;

export type NavKey = keyof typeof PAGE_TITLES;

export interface NavItem {
  id: NavKey;
  to: string;
  label: string;
  /** Match the path exactly instead of also matching sub-paths. */
  end?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { id: 'dashboard', to: PATHS.dashboard, label: PAGE_TITLES.dashboard },
  { id: 'questions', to: PATHS.questions, label: PAGE_TITLES.questions, end: true },
  { id: 'studyPlans', to: PATHS.studyPlans, label: PAGE_TITLES.studyPlans },
  { id: 'focusAreas', to: PATHS.focusAreas, label: PAGE_TITLES.focusAreas },
  { id: 'guides', to: PATHS.guides, label: PAGE_TITLES.guides },
  { id: 'mockInterview', to: PATHS.mockInterview, label: PAGE_TITLES.mockInterview },
  { id: 'companies', to: PATHS.companies, label: PAGE_TITLES.companies },
  { id: 'bookmarks', to: PATHS.bookmarks, label: PAGE_TITLES.bookmarks },
];
