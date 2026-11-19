'use client';

import { PointerEvent as ReactPointerEvent, ReactNode, useCallback, useRef, useState } from 'react';
import { Box } from '@mui/material';

const DEFAULT_LEFT_PCT = 40;
const MIN_LEFT_PCT = 20;
const MAX_LEFT_PCT = 75;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Draggable two-pane split on desktop (left width in %); stacks vertically on small screens. */
export function SplitPane({ left, right }: { left: ReactNode; right: ReactNode }) {
  const [pct, setPct] = useState(DEFAULT_LEFT_PCT);
  const ref = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      setPct(clamp(((ev.clientX - rect.left) / rect.width) * 100, MIN_LEFT_PCT, MAX_LEFT_PCT));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, []);

  return (
    <Box
      ref={ref}
      sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1, minHeight: 0 }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: `${pct}%` },
          minWidth: 0,
          overflow: 'auto',
          bgcolor: 'background.paper',
          maxHeight: { xs: '50vh', md: 'none' },
        }}
      >
        {left}
      </Box>
      <Box
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(pct)}
        onPointerDown={onPointerDown}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 6,
          cursor: 'col-resize',
          bgcolor: 'divider',
          '&:hover': { bgcolor: 'primary.main' },
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0, minHeight: { xs: 600, md: 0 } }}>{right}</Box>
    </Box>
  );
}
