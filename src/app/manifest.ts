import type { MetadataRoute } from 'next';
import { APP_DESCRIPTION, APP_NAME } from '@/constants/app';
import { PATHS } from '@/routes/paths';
import { LIGHT_TOKENS } from '@/theme/tokens';

/** Web app manifest: lets people install the site to their home screen or dock. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME}: Frontend Interview Prep`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: PATHS.dashboard,
    scope: '/',
    display: 'standalone',
    background_color: LIGHT_TOKENS.themeColor,
    theme_color: LIGHT_TOKENS.themeColor,
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Question bank', url: PATHS.questions },
      { name: 'Study plans', url: PATHS.studyPlans },
      { name: 'Dashboard', url: PATHS.dashboard },
    ],
  };
}
