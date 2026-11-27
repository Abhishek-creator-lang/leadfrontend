/** localStorage keys. Bump the version suffix when a stored shape changes incompatibly. */
export const STORAGE_KEYS = {
  progress: 'lead-frontend:progress:v1',
  themeMode: 'lead-frontend:themeMode',
  /** First version of saved live interview reports: read once and migrated. */
  liveInterview: 'lead-frontend:liveInterview:v1',
  liveInterviewReports: 'lead-frontend:liveInterview:v2',
  liveInterviewConfig: 'lead-frontend:liveInterviewConfig',
  /** Whether the live interview may use Chrome's on-device AI (the user's switch). */
  aiPrefs: 'lead-frontend:aiPrefs:v1',
} as const;
