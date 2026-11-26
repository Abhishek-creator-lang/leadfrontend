'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Paper, Stack, Typography } from '@mui/material';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { useMockInterview } from '@/context/MockInterviewContext';
import { useNow } from '@/hooks/useNow';
import { PATHS } from '@/routes/paths';
import { formatClock, secondsLeft } from '@/utils/mockInterview';

/**
 * Floating timer shown on every page except the mock interview page while a round is running, so
 * the clock stays visible in the question workspace.
 */
export function MockInterviewBar() {
  const pathname = usePathname();
  const { session } = useMockInterview();
  const round = session && !session.finishedAt ? session.rounds[session.current] : undefined;
  const running = Boolean(round?.startedAt);
  const now = useNow(running);
  if (!session || !round || !running || pathname === PATHS.mockInterview) return null;
  const left = secondsLeft(round, now);

  return (
    <Paper
      elevation={6}
      role="status"
      aria-label="Mock interview timer"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: (t) => t.zIndex.snackbar,
        px: 2,
        py: 1,
        borderRadius: 3,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <TimerRoundedIcon color={left < 0 ? 'error' : 'primary'} />
        <Typography variant="body2" color="text.secondary">
          Round {session.current + 1}/{session.rounds.length}
        </Typography>
        <Typography
          fontWeight={700}
          fontFamily="var(--font-mono)"
          color={left < 0 ? 'error.main' : left < 120 ? 'warning.main' : 'text.primary'}
        >
          {formatClock(left)}
        </Typography>
        <Button size="small" variant="contained" component={NextLink} href={PATHS.mockInterview}>
          Grade round
        </Button>
      </Stack>
    </Paper>
  );
}
