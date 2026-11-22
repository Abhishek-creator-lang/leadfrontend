'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Alert,
  Button,
  ButtonProps,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Link,
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import NextLink from 'next/link';
import type { ActionState } from '@/lib/actionState';
import { PATHS } from '@/routes/paths';

/** Submit button that disables itself and shows progress while the form's action runs. */
export function SubmitButton({ children, ...rest }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" size="large" fullWidth disabled={pending} {...rest}>
      {pending ? 'Please wait…' : children}
    </Button>
  );
}

/** Text input wired to an action's field errors and echoed values. */
export function FormField({
  name,
  state,
  ...rest
}: { name: string; state: ActionState } & Omit<TextFieldProps, 'name'>) {
  const error = state.errors?.[name];
  return (
    <TextField
      name={name}
      fullWidth
      size="medium"
      defaultValue={state.values?.[name]}
      error={!!error}
      helperText={error ?? rest.helperText}
      {...rest}
    />
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField(
  props: { name: string; state: ActionState } & Omit<TextFieldProps, 'name'>
) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField
      type={visible ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setVisible((v) => !v)}
              edge="end"
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}

/** Form-level success / error message. */
export function FormAlert({ state }: { state: ActionState }) {
  const error = state.errors?.form;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (state.ok && state.message) return <Alert severity="success">{state.message}</Alert>;
  return null;
}

/** Required "I agree to the Terms of Use and Privacy Policy" checkbox (field `acceptTerms`). */
export function TermsCheckbox({ state }: { state: ActionState }) {
  const error = state.errors?.acceptTerms;
  return (
    <FormControl error={!!error}>
      <FormControlLabel
        control={<Checkbox name="acceptTerms" required size="small" />}
        label={
          <>
            I agree to the{' '}
            <Link component={NextLink} href={PATHS.terms} target="_blank">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link component={NextLink} href={PATHS.privacy} target="_blank">
              Privacy Policy
            </Link>
          </>
        }
        slotProps={{ typography: { variant: 'body2' } }}
      />
      {error && <FormHelperText sx={{ mt: 0 }}>{error}</FormHelperText>}
    </FormControl>
  );
}
