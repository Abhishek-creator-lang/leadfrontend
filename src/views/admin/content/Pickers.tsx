'use client';

import { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { FORMAT_INFO } from '@/content/formats';
import type { Format } from '@/content/types';
import type { EntryStatus } from '@/server/repositories/content';

export interface QuestionOption {
  key: string;
  title: string;
  format: string;
  status: EntryStatus;
}

/** Free-text tag input with suggestions from the managed tag list. */
export function TagPicker({
  label,
  value,
  options,
  onChange,
  helperText,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  helperText?: string;
}) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      onChange={(_, v) => onChange([...new Set(v.map((t) => t.trim()).filter(Boolean))])}
      renderTags={(tags, getTagProps) =>
        tags.map((t, i) => {
          const { key, ...rest } = getTagProps({ index: i });
          return (
            <Chip
              key={key}
              size="small"
              label={t}
              color={options.includes(t) ? 'default' : 'warning'}
              {...rest}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText ?? 'Type and press Enter to add. Orange = not in the managed tag list yet.'}
        />
      )}
    />
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Ordered list of questions with search-to-add, reorder and remove. */
export function QuestionPicker({
  value,
  options,
  onChange,
  label = 'Questions',
}: {
  value: string[];
  options: QuestionOption[];
  onChange: (value: string[]) => void;
  label?: string;
}) {
  const byKey = useMemo(() => new Map(options.map((o) => [o.key, o])), [options]);
  const available = useMemo(() => options.filter((o) => !value.includes(o.key) && o.status !== 'archived'), [options, value]);

  return (
    <Box>
      <Autocomplete
        options={available}
        value={null}
        blurOnSelect
        clearOnBlur
        getOptionLabel={(o) => o.title}
        groupBy={(o) => FORMAT_INFO[o.format as Format]?.label ?? o.format}
        onChange={(_, o) => o && onChange([...value, o.key])}
        renderOption={(props, o) => {
          const { key, ...rest } = props;
          return (
            <li key={key} {...rest}>
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {o.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {o.key}
                  {o.status === 'draft' ? ' · draft (publish it first)' : ''}
                </Typography>
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => <TextField {...params} label={`Add to ${label.toLowerCase()}`} placeholder="Search questions…" />}
      />
      {value.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No questions yet.
        </Typography>
      ) : (
        <List dense sx={{ mt: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {value.map((key, i) => {
            const o = byKey.get(key);
            const problem = !o ? 'Unknown question' : o.status === 'draft' ? 'Not published' : o.status === 'archived' ? 'Archived' : null;
            return (
              <ListItem
                key={key}
                divider={i < value.length - 1}
                secondaryAction={
                  <Stack direction="row">
                    <IconButton size="small" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} aria-label="Move up">
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} aria-label="Move down">
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onChange(value.filter((k) => k !== key))} aria-label="Remove">
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  sx={{ pr: 12 }}
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {i + 1}.
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {o?.title ?? key}
                      </Typography>
                      {problem && (
                        <Tooltip title={`${problem}: learners won't see it, and publishing is blocked until it is published.`}>
                          <WarningAmberRoundedIcon fontSize="small" color="warning" />
                        </Tooltip>
                      )}
                    </Stack>
                  }
                  secondary={o ? FORMAT_INFO[o.format as Format]?.short : key}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export { move };
