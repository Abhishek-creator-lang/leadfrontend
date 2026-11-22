'use client';

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Format } from '@/content/types';
import { getTokens } from '@/theme/tokens';

/** Circular progress. Pass `format` to use that format's color; otherwise the primary color. */
export function ProgressRing({
  value,
  total,
  size = 56,
  thickness = 5,
  format,
}: {
  value: number;
  total: number;
  size?: number;
  thickness?: number;
  format?: Format;
}) {
  const theme = useTheme();
  const t = getTokens(theme.palette.mode);
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const stroke = format ? t.format[format] : t.primary;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${Math.round(pct)}% complete`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={t.bgSubtle}
          strokeWidth={thickness}
        />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={thickness}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 400ms ease' }}
          />
        )}
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <Typography variant="caption" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(pct)}%
        </Typography>
      </Box>
    </Box>
  );
}
