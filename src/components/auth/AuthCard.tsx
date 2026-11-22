'use client';

import { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { getTokens } from '@/theme/tokens';
import { APP_BAR_HEIGHT } from '@/constants/layout';

/** Centered card used by every sign-in / sign-up style page. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: { xs: 4, md: 8 },
        minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
        alignContent: 'start',
        // Warm vertical wash behind the card (reference login).
        backgroundImage: (t) => getTokens(t.palette.mode).gradient.authBg,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 4 } }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
          {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Stack>
        {children}
        {footer && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            {footer}
          </Box>
        )}
      </Card>
    </Box>
  );
}
