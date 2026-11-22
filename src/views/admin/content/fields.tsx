'use client';

import { ReactNode } from 'react';
import { Box, Card, MenuItem, Stack, TextField, TextFieldProps, Typography } from '@mui/material';
import { ICONS, NamedIcon } from '@/components/icons';
import type { FieldErrors } from './EditorShell';

/** "Array.prototype.at()" → "array-prototype-at" */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

/** Titled card grouping related fields. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card sx={{ p: 3, mb: 2 }}>
      <Typography fontWeight={700}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <Stack spacing={2} sx={{ mt: description ? 0 : 2 }}>
        {children}
      </Stack>
    </Card>
  );
}

/** Text input bound to a document field, showing its validation error. */
export function DocField({
  name,
  value,
  onValue,
  errors,
  ...rest
}: {
  name: string;
  value: string | number | undefined;
  onValue: (value: string) => void;
  errors: FieldErrors;
} & Omit<TextFieldProps, 'value' | 'onChange' | 'name'>) {
  const error = errors[name];
  return (
    <TextField
      fullWidth
      value={value ?? ''}
      onChange={(e) => onValue(e.target.value)}
      error={!!error}
      {...rest}
      helperText={error ?? rest.helperText}
    />
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onValue,
  allowEmpty,
  helperText,
}: {
  label: string;
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  onValue: (value: T | undefined) => void;
  allowEmpty?: string;
  helperText?: string;
}) {
  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value ?? ''}
      helperText={helperText}
      onChange={(e) => onValue((e.target.value || undefined) as T | undefined)}
    >
      {allowEmpty !== undefined && <MenuItem value="">{allowEmpty}</MenuItem>}
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function IconField({ value, onValue }: { value: string; onValue: (v: string) => void }) {
  return (
    <TextField
      select
      fullWidth
      label="Icon"
      value={value}
      onChange={(e) => onValue(e.target.value)}
      SelectProps={{
        renderValue: (v) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <NamedIcon name={String(v)} fontSize="small" />
            <span>{String(v)}</span>
          </Stack>
        ),
      }}
    >
      {Object.keys(ICONS).map((name) => (
        <MenuItem key={name} value={name}>
          <Stack direction="row" spacing={1} alignItems="center">
            <NamedIcon name={name} fontSize="small" />
            <span>{name}</span>
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  );
}

export type Source = { type: 'original' | 'mit-handbook' | 'mit-awesome-fesd'; url?: string };

export const SOURCE_OPTIONS = [
  { value: 'original', label: 'Original (written for this app)' },
  { value: 'mit-handbook', label: 'Front End Interview Handbook (MIT)' },
  { value: 'mit-awesome-fesd', label: 'Awesome Front End System Design (MIT)' },
] as const;

/** Attribution: original content, or adapted from an MIT-licensed source with a link. */
export function SourceFields({ value, onValue }: { value: Source; onValue: (v: Source) => void }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      <SelectField
        label="Source"
        value={value.type}
        options={SOURCE_OPTIONS}
        onValue={(type) => onValue({ type: type ?? 'original', url: type === 'original' ? undefined : value.url })}
      />
      {value.type !== 'original' && (
        <TextField
          label="Source URL"
          value={value.url ?? ''}
          onChange={(e) => onValue({ ...value, url: e.target.value || undefined })}
          placeholder="https://…"
        />
      )}
    </Box>
  );
}

/** Two- or three-column responsive grid for short fields. */
export function FieldRow({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: `repeat(${columns}, 1fr)` } }}>
      {children}
    </Box>
  );
}
