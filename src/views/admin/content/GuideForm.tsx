'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useConfirm } from '@/components/ConfirmDialog';
import type { GuideDoc } from '@/lib/validation/content';
import type { EditorFormProps } from './EditorShell';
import { DocField, FieldRow, FormSection, IconField, slugify, SourceFields } from './fields';
import { MarkdownEditor } from './MarkdownEditor';
import { move } from './Pickers';

type Chapter = GuideDoc['chapters'][number];

export function GuideForm({ doc, update, errors, isNew }: EditorFormProps<GuideDoc> & { isNew: boolean }) {
  const [open, setOpen] = useState<number | false>(false);
  const [confirm, confirmDialog] = useConfirm();
  const setChapter = (i: number, patch: Partial<Chapter>) =>
    update({ chapters: doc.chapters.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  const addChapter = () => {
    const n = doc.chapters.length + 1;
    update({
      chapters: [
        ...doc.chapters,
        { slug: `chapter-${n}`, title: `Chapter ${n}`, description: '', source: { type: 'original' }, body: '' },
      ],
    });
    setOpen(doc.chapters.length);
  };

  const removeChapter = async (i: number) => {
    const ok = await confirm({
      title: `Delete "${doc.chapters[i].title}"?`,
      message: 'The chapter is removed from the draft. Publish to remove it for learners.',
      confirmLabel: 'Delete chapter',
      tone: 'error',
    });
    if (ok) update({ chapters: doc.chapters.filter((_, j) => j !== i) });
  };

  return (
    <>
      <FormSection title="Guide">
        <FieldRow>
          <DocField
            name="title"
            label="Title"
            value={doc.title}
            errors={errors}
            onValue={(title) => update(isNew && !doc.chapters.length ? { title, id: slugify(title) } : { title })}
          />
          <DocField name="id" label="Slug (URL)" value={doc.id} errors={errors} onValue={(id) => update({ id })} helperText={`/guides/${doc.id || '…'}`} />
        </FieldRow>
        <DocField name="description" label="Description" value={doc.description} errors={errors} onValue={(description) => update({ description })} multiline minRows={2} />
        <IconField value={doc.icon} onValue={(icon) => update({ icon })} />
      </FormSection>

      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Chapters ({doc.chapters.length})
        </Typography>
        <Button startIcon={<AddRoundedIcon />} onClick={addChapter}>
          Add chapter
        </Button>
      </Stack>
      {doc.chapters.map((c, i) => (
        <Accordion key={i} expanded={open === i} onChange={(_, exp) => setOpen(exp ? i : false)} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
              <Typography color="text.secondary">{i + 1}.</Typography>
              <Typography fontWeight={600} noWrap sx={{ flex: 1 }}>
                {c.title || 'Untitled chapter'}
              </Typography>
              <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex' }}>
                <Tooltip title="Move up">
                  <span>
                    <IconButton size="small" disabled={i === 0} onClick={() => update({ chapters: move(doc.chapters, i, i - 1) })}>
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton size="small" disabled={i === doc.chapters.length - 1} onClick={() => update({ chapters: move(doc.chapters, i, i + 1) })}>
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Delete chapter">
                  <IconButton size="small" onClick={() => removeChapter(i)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FieldRow>
                <TextField label="Title" value={c.title} onChange={(e) => setChapter(i, { title: e.target.value })} error={!!errors[`chapters.${i}.title`]} helperText={errors[`chapters.${i}.title`]} />
                <TextField
                  label="Slug (URL)"
                  value={c.slug}
                  onChange={(e) => setChapter(i, { slug: e.target.value })}
                  error={!!errors[`chapters.${i}.slug`]}
                  helperText={errors[`chapters.${i}.slug`] ?? `/guides/${doc.id || '…'}/${c.slug || '…'}`}
                />
              </FieldRow>
              <TextField label="Description" value={c.description} onChange={(e) => setChapter(i, { description: e.target.value })} multiline minRows={2} />
              <SourceFields value={c.source} onValue={(source) => setChapter(i, { source })} />
              <MarkdownEditor label="Chapter body" value={c.body} onChange={(body) => setChapter(i, { body })} minRows={18} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
      {confirmDialog}
    </>
  );
}
