import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';

/** Centered, padded content column used by every non-workspace page. */
export function Page({
  children,
  maxWidth = CONTENT_MAX_WIDTH.default,
}: {
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <Box sx={{ maxWidth, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>{children}</Box>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { md: 'flex-end' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
