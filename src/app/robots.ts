import type { MetadataRoute } from 'next';
import { PATHS } from '@/routes/paths';
import { absoluteUrl, siteUrl } from '@/lib/seo';

/** Public content is crawlable; admin and account are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private areas only. Auth, dashboard, settings and bookmarks stay crawlable so bots can see
      // their `noindex` (a disallowed URL can still be indexed from external links).
      disallow: [PATHS.admin, PATHS.account],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl(),
  };
}
