'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Card,
  Divider,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import { Markdown } from '@/components/Markdown';
import { FONT_MONO } from '@/theme/fonts';

type Mode = 'write' | 'split' | 'preview';


/** [before, after, placeholder] wrapped around the selection (or inserted at the cursor). */
const SNIPPETS = {
  bold: ['**', '**', 'bold text'],
  italic: ['_', '_', 'italic text'],
  heading: ['\n## ', '\n', 'Heading'],
  code: ['`', '`', 'code'],
  block: ['\n```js\n', '\n```\n', '// code'],
  link: ['[', '](https://)', 'link text'],
  list: ['\n- ', '\n', 'item'],
  table: ['\n| Column | Column |\n| --- | --- |\n| ', ' | value |\n', 'value'],
  mermaid: ['\n```mermaid\nflowchart LR\n  ', '\n```\n', 'A --> B'],
} as const;

const TOOLS: { key: keyof typeof SNIPPETS; label: string; icon: React.ReactNode }[] = [
  { key: 'heading', label: 'Heading', icon: <TitleRoundedIcon fontSize="small" /> },
  { key: 'bold', label: 'Bold', icon: <FormatBoldRoundedIcon fontSize="small" /> },
  { key: 'italic', label: 'Italic', icon: <FormatItalicRoundedIcon fontSize="small" /> },
  { key: 'code', label: 'Inline code', icon: <CodeRoundedIcon fontSize="small" /> },
  { key: 'block', label: 'Code block', icon: <DataObjectRoundedIcon fontSize="small" /> },
  { key: 'link', label: 'Link', icon: <LinkRoundedIcon fontSize="small" /> },
  { key: 'list', label: 'List', icon: <FormatListBulletedRoundedIcon fontSize="small" /> },
  { key: 'table', label: 'Table', icon: <TableChartRoundedIcon fontSize="small" /> },
  { key: 'mermaid', label: 'Mermaid diagram', icon: <AccountTreeRoundedIcon fontSize="small" /> },
];

/** Markdown field with a small formatting toolbar and a live preview (same renderer learners see). */
export function MarkdownEditor({
  label,
  value,
  onChange,
  minRows = 14,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
  helperText?: string;
}) {
  const [mode, setMode] = useState<Mode>('split');
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = (key: keyof typeof SNIPPETS) => {
    const el = ref.current;
    const [before, after, placeholder] = SNIPPETS[key];
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const height = `${minRows * 1.6}em`;

  return (
    <Card variant="outlined">
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ px: 1, py: 0.5, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ px: 1, mr: 1 }}>
          {label}
        </Typography>
        {mode !== 'preview' &&
          TOOLS.map((t) => (
            <Tooltip key={t.key} title={t.label}>
              <IconButton size="small" onClick={() => insert(t.key)} aria-label={t.label}>
                {t.icon}
              </IconButton>
            </Tooltip>
          ))}
        <Box sx={{ flex: 1 }} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_, v: Mode | null) => v && setMode(v)}
          aria-label="Editor layout"
        >
          <ToggleButton value="write">Write</ToggleButton>
          <ToggleButton value="split" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
            Split
          </ToggleButton>
          <ToggleButton value="preview">Preview</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box sx={{ display: 'flex', minHeight: height }}>
        {mode !== 'preview' && (
          <Box
            component="textarea"
            ref={ref}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            spellCheck
            aria-label={label}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: height,
              resize: 'vertical',
              border: 0,
              outline: 0,
              p: 2,
              fontFamily: FONT_MONO,
              fontSize: 13.5,
              lineHeight: 1.6,
              bgcolor: 'background.paper',
              color: 'text.primary',
            }}
          />
        )}
        {mode === 'split' && <Divider orientation="vertical" flexItem />}
        {mode !== 'write' && (
          <Box sx={{ flex: 1, minWidth: 0, p: 2, overflow: 'auto', maxHeight: '70vh' }}>
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <Typography color="text.secondary">Nothing to preview yet.</Typography>
            )}
          </Box>
        )}
      </Box>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 0.75, borderTop: 1, borderColor: 'divider' }}>
          {helperText}
        </Typography>
      )}
    </Card>
  );
}
