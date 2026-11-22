'use client';

import { ReactNode, useCallback, useRef, useState } from 'react';
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Colour of the confirm button, e.g. "error" for destructive actions. */
  tone?: ButtonProps['color'];
}

/**
 * Promise-based confirmation dialog (a themed replacement for `window.confirm`).
 *
 *   const [confirm, dialog] = useConfirm();
 *   if (await confirm({ title: 'Delete?' })) …
 *   return <>{dialog}…</>;
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = useCallback(
    (next: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOptions(next);
      }),
    []
  );

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = undefined;
    setOptions(null);
  };

  const dialog = (
    <Dialog open={!!options} onClose={() => close(false)} maxWidth="xs" fullWidth>
      {options && (
        <>
          <DialogTitle>{options.title}</DialogTitle>
          {options.message && (
            <DialogContent>
              <DialogContentText component="div">{options.message}</DialogContentText>
            </DialogContent>
          )}
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => close(false)} color="inherit">
              {options.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              onClick={() => close(true)}
              variant="contained"
              color={options.tone ?? 'primary'}
              autoFocus
            >
              {options.confirmLabel ?? 'Confirm'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return [confirm, dialog];
}
