import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { percent } from '@/utils/progress';

/**
 * Completion bar with a "`done / total` completed" line.
 * With `label`, the count sits in a header row above the bar instead of below it.
 */
export function ProgressSummary({
  done,
  total,
  unit = 'completed',
  label,
}: {
  done: number;
  total: number;
  unit?: string;
  label?: string;
}) {
  const bar = <LinearProgress variant="determinate" value={percent(done, total)} color="success" />;
  const count = `${done} / ${total} ${unit}`;

  if (label) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {count}
          </Typography>
        </Stack>
        {bar}
      </Box>
    );
  }

  return (
    <Box>
      {bar}
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        {count}
      </Typography>
    </Box>
  );
}
