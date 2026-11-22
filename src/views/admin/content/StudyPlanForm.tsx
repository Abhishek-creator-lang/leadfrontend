'use client';

import { Box, Button, Card, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import type { FocusAreaDoc, StudyPlanDoc } from '@/lib/validation/content';
import type { EditorFormProps } from './EditorShell';
import { DocField, FieldRow, FormSection, IconField, slugify } from './fields';
import { move, QuestionPicker, type QuestionOption } from './Pickers';

type Section = StudyPlanDoc['sections'][number];

export function StudyPlanForm({
  doc,
  update,
  errors,
  isNew,
  questions,
}: EditorFormProps<StudyPlanDoc> & { isNew: boolean; questions: QuestionOption[] }) {
  const setSection = (i: number, patch: Partial<Section>) =>
    update({ sections: doc.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const total = doc.sections.reduce((n, s) => n + s.questions.length, 0);

  return (
    <>
      <FormSection title="Study plan">
        <FieldRow>
          <DocField name="title" label="Title" value={doc.title} errors={errors} onValue={(title) => update(isNew ? { title, id: slugify(title) } : { title })} />
          <DocField name="id" label="Slug (URL)" value={doc.id} errors={errors} onValue={(id) => update({ id })} helperText={`/study-plans/${doc.id || '…'}`} />
        </FieldRow>
        <DocField name="subtitle" label="Subtitle" value={doc.subtitle} errors={errors} onValue={(subtitle) => update({ subtitle })} />
        <DocField name="description" label="Description" value={doc.description} errors={errors} onValue={(description) => update({ description })} multiline minRows={3} />
        <FieldRow columns={3}>
          <DocField name="weeks" label="Weeks" type="number" value={doc.weeks} errors={errors} onValue={(v) => update({ weeks: Math.max(1, Math.round(Number(v) || 1)) })} inputProps={{ min: 1 }} />
          <DocField name="hoursPerWeek" label="Hours per week" value={doc.hoursPerWeek} errors={errors} onValue={(hoursPerWeek) => update({ hoursPerWeek })} helperText="e.g. 6–8" />
          <DocField name="audience" label="Audience" value={doc.audience} errors={errors} onValue={(audience) => update({ audience })} />
        </FieldRow>
      </FormSection>

      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Sections · {total} questions
        </Typography>
        <Button
          startIcon={<AddRoundedIcon />}
          onClick={() => update({ sections: [...doc.sections, { title: `Section ${doc.sections.length + 1}`, description: '', questions: [] }] })}
        >
          Add section
        </Button>
      </Stack>
      {doc.sections.map((s, i) => (
        <Card key={i} sx={{ p: 2.5, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
            <TextField
              label={`Section ${i + 1} title`}
              value={s.title}
              onChange={(e) => setSection(i, { title: e.target.value })}
              error={!!errors[`sections.${i}.title`]}
              helperText={errors[`sections.${i}.title`]}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', pt: 1 }}>
              <Tooltip title="Move up">
                <span>
                  <IconButton size="small" disabled={i === 0} onClick={() => update({ sections: move(doc.sections, i, i - 1) })}>
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton size="small" disabled={i === doc.sections.length - 1} onClick={() => update({ sections: move(doc.sections, i, i + 1) })}>
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete section">
                <IconButton size="small" onClick={() => update({ sections: doc.sections.filter((_, j) => j !== i) })}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
          <TextField
            label="Description (optional)"
            value={s.description ?? ''}
            onChange={(e) => setSection(i, { description: e.target.value || undefined })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <QuestionPicker value={s.questions} options={questions} onChange={(qs) => setSection(i, { questions: qs })} />
        </Card>
      ))}
    </>
  );
}

export function FocusAreaForm({
  doc,
  update,
  errors,
  isNew,
  questions,
}: EditorFormProps<FocusAreaDoc> & { isNew: boolean; questions: QuestionOption[] }) {
  return (
    <>
      <FormSection title="Focus area">
        <FieldRow>
          <DocField name="title" label="Title" value={doc.title} errors={errors} onValue={(title) => update(isNew ? { title, id: slugify(title) } : { title })} />
          <DocField name="id" label="Slug (URL)" value={doc.id} errors={errors} onValue={(id) => update({ id })} helperText={`/focus-areas/${doc.id || '…'}`} />
        </FieldRow>
        <DocField name="description" label="Description" value={doc.description} errors={errors} onValue={(description) => update({ description })} multiline minRows={2} />
        <IconField value={doc.icon} onValue={(icon) => update({ icon })} />
      </FormSection>
      <FormSection title={`Questions (${doc.questions.length})`} description="In the order learners see them.">
        <QuestionPicker value={doc.questions} options={questions} onChange={(qs) => update({ questions: qs })} />
      </FormSection>
    </>
  );
}
