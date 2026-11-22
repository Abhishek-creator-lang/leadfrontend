'use client';

import { useState } from 'react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import { BRAND_COLORS } from '@/constants/colors';
import { useSupportSettings } from '@/context/SupportContext';
import { SupportDialog } from './SupportButton';

/** Dashboard call-to-action for "Buy me a coffee". Hidden when the feature or this placement is off. */
export function SupportCard() {
  const settings = useSupportSettings();
  const [open, setOpen] = useState(false);
  if (!settings?.showOnDashboard) return null;

  return (
    <Card sx={{ p: 2.5, mb: 5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            flexShrink: 0,
          }}
        >
          <LocalCafeRoundedIcon sx={{ color: BRAND_COLORS.streak }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={700}>{settings.heading}</Typography>
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
