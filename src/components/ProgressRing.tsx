import { Box, CircularProgress, Typography } from '@mui/material';

export function ProgressRing({
  value,
  total,
  size = 56,
  color,
}: {
  value: number;
  total: number;
  size?: number;
  color?: string;
}) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={4}
        sx={{ color: 'divider', position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={4}
        sx={{
          color: color ?? 'success.main',
          position: 'absolute',
          '& circle': { strokeLinecap: 'round' },
        }}
      />
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <Typography variant="caption" fontWeight={700}>
          {Math.round(pct)}%
        </Typography>
      </Box>
    </Box>
  );
}
