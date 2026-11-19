import { ReactNode } from 'react';
import NextLink from 'next/link';
import { Card, CardActionArea, SxProps, Theme } from '@mui/material';

/**
 * A full-height clickable card that navigates to `href`.
 * `stack` lays the children out as a column so a footer (e.g. a progress bar) sticks to the bottom.
 */
export function LinkCard({
  href,
  children,
  padding = 2.5,
  stack = false,
  sx,
}: {
  href: string;
  children: ReactNode;
  padding?: number;
  stack?: boolean;
  sx?: SxProps<Theme>;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={NextLink}
        href={href}
        sx={[
          { p: padding, height: '100%' },
          stack && { display: 'flex', flexDirection: 'column', alignItems: 'stretch' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </CardActionArea>
    </Card>
  );
}
