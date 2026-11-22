'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import { useSupportSettings } from '@/context/SupportContext';
import { SupportPanel } from './SupportPanel';

/** App bar "Buy me a coffee" button that opens the UPI QR dialog. Hidden when the feature is off. */
export function SupportButton() {
  const settings = useSupportSettings();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  if (!settings?.showInHeader) return null;

  return (
    <>
      {compact ? (
        <Tooltip title={settings.heading}>
          <IconButton onClick={() => setOpen(true)} aria-label={settings.heading}>
            <LocalCafeRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          color="inherit"
          startIcon={<LocalCafeRoundedIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {settings.heading}
        </Button>
      )}
      <SupportDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function SupportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useSupportSettings();
  if (!settings) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6, textAlign: 'center' }}>
        {settings.heading} ☕
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <SupportPanel settings={settings} />
      </DialogContent>
    </Dialog>
  );
}
