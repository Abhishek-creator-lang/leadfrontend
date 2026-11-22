'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import type { SupportSettings } from '@/lib/validation/support';
import { buildUpiUri, formatRupees } from '@/utils/upi';
import NextLink from 'next/link';
import { PATHS } from '@/routes/paths';
import { FONT_MONO } from '@/theme/fonts';

const QR_SIZE = 208;

/** UPI QR (updates with the chosen amount), pay-in-app button for phones and copy-UPI-ID. */
export function SupportPanel({ settings }: { settings: SupportSettings }) {
  const [amount, setAmount] = useState<number | undefined>(
    settings.amounts[1] ?? settings.amounts[0]
  );
  const [copied, setCopied] = useState(false);

  const uri = buildUpiUri({
    upiId: settings.upiId,
    payeeName: settings.payeeName,
    amount,
    note: settings.paymentNote,
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context); the ID is visible to copy manually.
    }
  };

  return (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      {settings.message && <Typography color="text.secondary">{settings.message}</Typography>}

      {settings.amounts.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
          {settings.amounts.map((a) => (
            <Chip
              key={a}
              label={formatRupees(a)}
              color={amount === a ? 'primary' : 'default'}
              variant={amount === a ? 'filled' : 'outlined'}
              onClick={() => setAmount(a)}
            />
          ))}
          <Chip
            label="Any amount"
            color={amount === undefined ? 'primary' : 'default'}
            variant={amount === undefined ? 'filled' : 'outlined'}
            onClick={() => setAmount(undefined)}
          />
        </Stack>
      )}

      {/* QR codes need dark-on-light to scan reliably, so the tile stays white in dark mode. */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#fff',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          lineHeight: 0,
        }}
      >
        <QRCodeSVG
          value={uri}
          size={QR_SIZE}
          level="M"
          title={`UPI QR code to pay ${settings.payeeName}${amount ? ` ${formatRupees(amount)}` : ''}`}
        />
      </Box>

      <Box>
        <Typography fontWeight={600}>
          {settings.payeeName}
          {amount ? ` · ${formatRupees(amount)}` : ''}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: FONT_MONO }}>
            {settings.upiId}
          </Typography>
          <Tooltip title={copied ? 'Copied' : 'Copy UPI ID'}>
            <IconButton size="small" onClick={copy} aria-label="Copy UPI ID">
              {copied ? (
                <CheckRoundedIcon fontSize="small" color="success" />
              ) : (
                <ContentCopyRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Scan with any UPI app: Google Pay, PhonePe, Paytm, BHIM…
        </Typography>
      </Box>

      {/* On phones the QR can't be scanned from the same screen: open the UPI app directly. */}
      <Button
        href={uri}
        variant="contained"
        startIcon={<PhoneIphoneRoundedIcon />}
        sx={{ display: { xs: 'inline-flex', md: 'none' } }}
      >
        Pay with UPI app
      </Button>

      {settings.thankYou && (
        <Alert severity="success" icon={false} sx={{ width: '100%', justifyContent: 'center' }}>
          {settings.thankYou}
        </Alert>
      )}

      {settings.externalUrl && (
        <Link href={settings.externalUrl} target="_blank" rel="noreferrer" variant="body2">
          {settings.externalLabel || 'Support from outside India'}{' '}
          <OpenInNewRoundedIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} />
        </Link>
      )}

      <Typography variant="caption" color="text.secondary" textAlign="center">
        A voluntary contribution to a free project. Nothing is sold, and contributions are
        non-refundable. See the{' '}
        <Link component={NextLink} href={PATHS.terms} color="inherit">
          Terms
        </Link>
        .
      </Typography>
    </Stack>
  );
}
