'use client';

import { ReactNode } from 'react';
import NextLink from 'next/link';
import { CardActionArea } from '@mui/material';

/** Clickable card body that Server Components can render (navigates with next/link). */
export function LinkCardArea({ href, children }: { href: string; children: ReactNode }) {
  return (
    <CardActionArea
      component={NextLink}
      href={href}
      sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
    >
      {children}
    </CardActionArea>
  );
}
