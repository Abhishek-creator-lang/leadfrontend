'use client';

import { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { getTokens } from '@/theme/tokens';

/** Icon tile + label + value (+ optional hint). */
export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            backgroundImage: (t) => getTokens(t.palette.mode).gradient.goldCard,
            border: 1,
            borderColor: 'divider',
            '& svg': { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="h5"
            component="p"
            fontWeight={700}
            lineHeight={1.3}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
