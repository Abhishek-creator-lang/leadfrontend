'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { toISODate } from '@/utils/date';

const WEEKS = 26;

/** GitHub-style contribution grid for the last 26 weeks of completions. */
export function ActivityHeatmap({ activity }: { activity: Record<string, number> }) {
  // "Today" is only known in the browser: pages are pre-rendered at build time.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const weeks = useMemo(() => {
    if (!now) return [];
    const end = now;
    const start = new Date(end);
    start.setDate(end.getDate() - (WEEKS * 7 - 1) - end.getDay());
    const cols: { date: string; count: number; future: boolean }[][] = [];
    const d = new Date(start);
    for (let w = 0; w < WEEKS + 1; w++) {
      const col = [];
      for (let i = 0; i < 7; i++) {
        const key = toISODate(d);
        col.push({ date: key, count: activity[key] ?? 0, future: d > end });
        d.setDate(d.getDate() + 1);
      }
      cols.push(col);
    }
    return cols;
  }, [activity, now]);

  const level = (c: number) => (c === 0 ? 0 : c < 2 ? 0.35 : c < 4 ? 0.6 : c < 7 ? 0.8 : 1);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: '3px',
          overflowX: 'auto',
          pb: 1,
          minHeight: 7 * 12 + 6 * 3 + 8,
        }}
      >
        {weeks.map((col, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {col.map((cell) => (
              <Tooltip
                key={cell.date}
                title={`${cell.count} completed · ${cell.date}`}
                disableInteractive
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '3px',
                    visibility: cell.future ? 'hidden' : 'visible',
                    bgcolor: cell.count ? 'success.main' : 'action.hover',
                    opacity: cell.count ? level(cell.count) : 1,
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary">
          Less
        </Typography>
        {[0, 0.35, 0.6, 0.8, 1].map((o) => (
          <Box
            key={o}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '2px',
              bgcolor: o ? 'success.main' : 'action.hover',
              opacity: o || 1,
            }}
          />
        ))}
        <Typography variant="caption" color="text.secondary">
          More
        </Typography>
      </Stack>
    </Box>
  );
}
