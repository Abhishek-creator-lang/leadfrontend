'use client';

import { useState, useTransition } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { renameTagAction } from '@/app/admin/content/actions';
import type { CompanyDoc, TaxonomyDoc } from '@/lib/validation/content';
import type { EditorFormProps } from './EditorShell';
import { DocField, FieldRow, FormSection, slugify, SourceFields } from './fields';
import { MarkdownEditor } from './MarkdownEditor';

export function CompanyForm({ doc, update, errors, isNew }: EditorFormProps<CompanyDoc> & { isNew: boolean }) {
  return (
    <>
      <FormSection title="Company">
        <FieldRow columns={3}>
          <DocField
            name="name"
            label="Company name"
            value={doc.name}
            errors={errors}
            onValue={(name) =>
              update(isNew ? { name, slug: slugify(name), title: `${name} front end interview guide` } : { name })
            }
          />
          <DocField name="slug" label="Slug (URL)" value={doc.slug} errors={errors} onValue={(slug) => update({ slug })} helperText={`/companies/${doc.slug || '…'}`} />
          <DocField name="title" label="Page title" value={doc.title} errors={errors} onValue={(title) => update({ title })} />
        </FieldRow>
        <SourceFields value={doc.source} onValue={(source) => update({ source })} />
      </FormSection>
      <MarkdownEditor label="Guide" value={doc.body} onChange={(body) => update({ body })} minRows={20} />
    </>
  );
}

/** One managed tag list: add, remove, and rename across all questions. */
function TagList({
  kind,
  label,
  values,
  onValues,
}: {
  kind: 'topics' | 'companies';
  label: string;
  values: string[];
  onValues: (v: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const add = () => {
    const tags = input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!tags.length) return;
    onValues([...new Set([...values, ...tags])].sort((a, b) => a.localeCompare(b)));
    setInput('');
  };

  const rename = () =>
    startTransition(async () => {
      if (!renaming) return;
      const r = await renameTagAction(kind, renaming, newName);
      setResult({ ok: r.ok, message: r.message ?? '' });
      if (r.ok) {
        onValues([...new Set(values.map((v) => (v === renaming ? newName.trim() : v)))].sort((a, b) => a.localeCompare(b)));
        setRenaming(null);
      }
    });

  return (
    <FormSection title={`${label} (${values.length})`} description="Click a tag to rename it in every question draft. Remove only takes it off this suggestion list.">
      {result && (
        <Alert severity={result.ok ? 'success' : 'error'} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          label={`Add ${label.toLowerCase()}`}
          placeholder="Comma-separated"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          sx={{ flex: 1 }}
        />
        <Button onClick={add} variant="outlined">
          Add
        </Button>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {values.map((v) => (
          <Chip
            key={v}
            label={v}
            onClick={() => {
              setRenaming(v);
              setNewName(v);
            }}
            onDelete={() => onValues(values.filter((x) => x !== v))}
          />
        ))}
      </Stack>
      <Dialog open={!!renaming} onClose={() => setRenaming(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename “{renaming}”</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Every question draft using it is updated (use an existing name to merge). Publish the questions to update learners.
          </Typography>
          <TextField autoFocus fullWidth label="New name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenaming(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={rename} variant="contained" disabled={pending || !newName.trim() || newName.trim() === renaming}>
            Rename everywhere
          </Button>
        </DialogActions>
      </Dialog>
    </FormSection>
  );
}

export function TaxonomyForm({ doc, update }: EditorFormProps<TaxonomyDoc>) {
  return (
    <>
      <TagList kind="topics" label="Topics" values={doc.topics} onValues={(topics) => update({ topics })} />
      <TagList kind="companies" label="Companies" values={doc.companies} onValues={(companies) => update({ companies })} />
    </>
  );
}
