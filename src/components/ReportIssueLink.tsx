'use client';

import { usePathname } from 'next/navigation';
import { Link, Typography } from '@mui/material';
import { LEGAL } from '@/constants/legal';

/** "Report an issue" mailto link for content errors or rights concerns, with the page in the subject. */
export function ReportIssueLink() {
  const path = usePathname() ?? '';
  const subject = encodeURIComponent(`Content issue: ${path}`);
  return (
    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
      Spotted a mistake or a rights concern?{' '}
      <Link href={`mailto:${LEGAL.contactEmail}?subject=${subject}`} color="inherit">
        Report an issue
      </Link>
    </Typography>
  );
}
