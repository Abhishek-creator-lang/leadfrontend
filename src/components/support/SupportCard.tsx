'use client';

import { useState } from 'react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import { useTheme } from '@mui/material/styles';
import { useSupportSettings } from '@/context/SupportContext';
import { useModeColors } from '@/hooks/useModeColors';
import { SupportDialog } from './SupportButton';

/** Dashboard call-to-action for "Buy me a coffee". Hidden when the feature or this placement is off. */
export function SupportCard() {
  const settings = useSupportSettings();
  const [open, setOpen] = useState(false);
  const mc = useModeColors();
  const mode = useTheme().palette.mode;
  if (!settings?.showOnDashboard) return null;

  return (
    // Teal panel with a gradient border and a soft glow (reference: HelpBanner / LearnerTabNav).
    <Card
      sx={{
        p: 2.5,
        mb: 5,
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        backgroundImage: mc.gradient.tealPanel,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '1px',
          background: mc.gradient.tealBorder,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          display: { xs: 'none', md: mode === 'light' ? 'block' : 'none' },
          position: 'absolute',
          width: 520,
          height: 180,
          right: -120,
          top: '40%',
          bgcolor: '#7AD1BE',
          filter: 'blur(90px)',
          opacity: 0.6,
          borderRadius: '50%',
          pointerEvents: 'none',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <LocalCafeRoundedIcon sx={{ color: mc.secondaryText }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600}>{settings.heading}</Typography>
          <Typography variant="body2" color="text.secondary">
            {settings.message}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ flexShrink: 0 }}>
          Support with UPI
        </Button>
      </Stack>
      <SupportDialog open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
