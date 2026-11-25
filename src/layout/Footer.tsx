import { Box, Link, Stack, Typography } from '@mui/material';
import NextLink from 'next/link';
import { APP_NAME } from '@/constants/app';
import { LANDINGS } from '@/content/landings';
import { PATHS, landingPath } from '@/routes/paths';

export const LEGAL_LINKS = [
  { href: PATHS.terms, label: 'Terms' },
  { href: PATHS.privacy, label: 'Privacy' },
  { href: PATHS.disclaimer, label: 'Disclaimer' },
  { href: PATHS.copyright, label: 'Copyright' },
  { href: PATHS.licenses, label: 'Licenses & credits' },
] as const;

/** Site-wide links to the search landing pages (also how crawlers find them from every page). */
const POPULAR_LINKS = [
  ...LANDINGS.map((l) => ({ href: landingPath(l.slug), label: `${l.name} interview questions` })),
  { href: PATHS.focusAreas, label: 'Questions by topic' },
  { href: PATHS.companies, label: 'Company guides' },
];

/** Site footer: popular pages, legal links and the accuracy and no-affiliation notice. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 2, md: 4 }, py: 3, mt: 4 }}
    >
      <Stack
        component="nav"
        aria-label="Popular interview questions"
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={2}
        sx={{ maxWidth: 1200, mx: 'auto', mb: 2 }}
      >
        {POPULAR_LINKS.map((l) => (
          <Link
            key={l.href}
            component={NextLink}
            href={l.href}
            variant="caption"
            color="text.secondary"
            underline="hover"
          >
            {l.label}
          </Link>
        ))}
      </Stack>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, md: 3 }}
        justifyContent="space-between"
        alignItems={{ md: 'center' }}
        sx={{ maxWidth: 1200, mx: 'auto' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 640 }}>
          © {new Date().getFullYear()} {APP_NAME}. Free educational content, provided as is; it may
          contain errors. Not affiliated with any company or product named on this site.
        </Typography>
        <Stack
          component="nav"
          aria-label="Legal"
          direction="row"
          flexWrap="wrap"
          useFlexGap
          spacing={2}
        >
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              component={NextLink}
              href={l.href}
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              {l.label}
            </Link>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
