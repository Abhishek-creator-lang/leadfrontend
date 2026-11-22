'use client';

import { useActionState, useState } from 'react';
import {
  Box,
  Card,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { saveSupportSettingsAction } from '@/app/admin/support/actions';
import { FormAlert, SubmitButton } from '@/components/auth/FormParts';
import { SupportPanel } from '@/components/support/SupportPanel';
import { initialActionState } from '@/lib/actionState';
import { isSupportActive, type SupportSettings } from '@/lib/validation/support';

const parseAmounts = (raw: string) =>
  [
    ...new Set(
      raw
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
    ),
  ]
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);

/** Super admin form for "Buy me a coffee", with a live preview of what visitors will see. */
export function SupportSettingsForm({ initial }: { initial: SupportSettings }) {
  const [state, action] = useActionState(saveSupportSettingsAction, initialActionState);
  // Controlled copy of the form so the preview updates while typing.
  const [draft, setDraft] = useState(initial);
  const [amountsText, setAmountsText] = useState(initial.amounts.join(', '));
  const set = <K extends keyof SupportSettings>(key: K, value: SupportSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const text = (
    key: keyof SupportSettings,
    label: string,
    { helperText, ...extra }: { helperText?: string } & Record<string, unknown> = {}
  ) => (
    <TextField
      name={key}
      label={label}
      fullWidth
      value={draft[key] as string}
      onChange={(e) => set(key, e.target.value as never)}
      error={!!state.errors?.[key]}
      helperText={state.errors?.[key] ?? helperText}
      {...extra}
    />
  );

  const toggle = (key: keyof SupportSettings, label: string) => (
    <FormControlLabel
      control={
        <Switch
          name={key}
          checked={draft[key] as boolean}
          onChange={(e) => set(key, e.target.checked as never)}
        />
      }
      label={label}
    />
  );

  const preview = { ...draft, amounts: parseAmounts(amountsText) };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Card sx={{ p: 3 }}>
          <form action={action} noValidate>
            <Stack spacing={2.5}>
              <FormAlert state={state} />
              {toggle('enabled', 'Show "Buy me a coffee" on the site')}

              <Typography fontWeight={600}>UPI details</Typography>
              {text('upiId', 'UPI ID', {
                placeholder: 'yourname@okhdfcbank',
                helperText:
                  'Payments go straight to this UPI ID. Scan the preview with your phone to check it.',
              })}
              {text('payeeName', 'Payee name', { helperText: 'Shown in the UPI app' })}
              <TextField
                name="amounts"
                label="Suggested amounts (₹)"
                fullWidth
                value={amountsText}
                onChange={(e) => setAmountsText(e.target.value)}
                error={!!state.errors?.amounts}
                helperText={
                  state.errors?.amounts ??
                  'Comma separated, up to 6. Visitors can also pay any amount.'
                }
              />
              {text('paymentNote', 'Payment note', {
                helperText: 'Pre-filled in the UPI app (max 50 characters)',
              })}

              <Divider />
              <Typography fontWeight={600}>Text</Typography>
              {text('heading', 'Heading')}
              {text('message', 'Message', { multiline: true, minRows: 2 })}
              {text('thankYou', 'Thank-you note', { multiline: true, minRows: 2 })}

              <Divider />
              <Typography fontWeight={600}>Supporters outside India (optional)</Typography>
              {text('externalUrl', 'Link', { placeholder: 'https://buymeacoffee.com/yourname' })}
              {text('externalLabel', 'Link text')}

              <Divider />
              <Typography fontWeight={600}>Where to show it</Typography>
              <Box>
                {toggle('showInHeader', 'Button in the top bar')}
                {toggle('showInSidebar', 'Link in the sidebar')}
                {toggle('showOnDashboard', 'Card on the dashboard')}
              </Box>
              <Typography variant="caption" color="text.secondary">
                The /support page is always available while the feature is on.
              </Typography>

              <SubmitButton fullWidth={false} sx={{ alignSelf: 'flex-start' }}>
                Save settings
              </SubmitButton>
            </Stack>
          </form>
        </Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card sx={{ p: 3, position: { md: 'sticky' }, top: { md: 72 } }}>
          <Typography variant="overline" color="text.secondary">
            Preview
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
            {preview.heading} ☕
          </Typography>
          {isSupportActive({ ...preview, enabled: true }) ? (
            <SupportPanel key={preview.amounts.join()} settings={preview} />
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Enter a valid UPI ID and payee name to see the QR code.
            </Typography>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
