'use client';

import { useState } from 'react';
import { Box, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import { FORMAT_INFO, FORMAT_ORDER, QUIZ_CATEGORY_LABEL } from '@/content/formats';
import type { QuestionDoc } from '@/lib/validation/content';
import { CODING_FORMATS } from '@/lib/validation/content';
import { CodeFilesEditor } from './CodeFilesEditor';
import { defaultFiles } from './emptyDocs';
import type { EditorFormProps } from './EditorShell';
import { DocField, FieldRow, FormSection, SelectField, slugify, SourceFields } from './fields';
import { MarkdownEditor } from './MarkdownEditor';
import { TagPicker } from './Pickers';

const DIFFICULTY = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;
const IMPORTANCE = [
  { value: 'high', label: 'High' },
  { value: 'mid', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;
const SD_TYPES = [
  { value: 'application', label: 'Application' },
  { value: 'component', label: 'Component' },
  { value: 'lead', label: 'Lead / architecture' },
] as const;
const FRAMEWORKS = ['react', 'vanilla'] as const;
const LANGUAGES = ['js', 'ts', 'html', 'css'] as const;

/** Multi-select chips for a small fixed list. */
function ChipToggles<T extends string>({ label, options, value, onValue }: { label: string; options: readonly T[]; value: T[]; onValue: (v: T[]) => void }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1}>
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <Chip
              key={o}
              label={o}
              color={on ? 'primary' : 'default'}
              variant={on ? 'filled' : 'outlined'}
              onClick={() => onValue(on ? value.filter((x) => x !== o) : [...value, o])}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

export function QuestionForm({
  doc,
  update,
  errors,
  isNew,
  topicOptions,
  companyOptions,
}: EditorFormProps<QuestionDoc> & { isNew: boolean; topicOptions: string[]; companyOptions: string[] }) {
  const coding = (CODING_FORMATS as readonly string[]).includes(doc.format);
  const [tab, setTab] = useState<'prompt' | 'solution' | 'code'>('prompt');
  // New questions derive the slug from the title until the slug is edited by hand.
  const [slugTouched, setSlugTouched] = useState(!isNew);

  return (
    <>
      <FormSection title="Details" description="What learners see in lists and at the top of the question.">
        <DocField
          name="title"
          label="Title"
          value={doc.title}
          errors={errors}
          onValue={(title) => update(slugTouched ? { title } : { title, slug: slugify(title) })}
        />
        <FieldRow>
          <SelectField
            label="Format"
            value={doc.format}
            options={FORMAT_ORDER.map((f) => ({ value: f, label: FORMAT_INFO[f].label }))}
            onValue={(format) => {
              if (!format) return;
              const wasCoding = (CODING_FORMATS as readonly string[]).includes(doc.format);
              const nowCoding = (CODING_FORMATS as readonly string[]).includes(format);
              // Give a new coding question sensible files; never touch existing code.
              const keepFiles = Object.keys(doc.files).length > 0 && wasCoding === nowCoding;
              update({ format, files: keepFiles ? doc.files : nowCoding ? defaultFiles(format) : {} });
            }}
            helperText="Changing the format changes the URL; old links redirect after publishing."
          />
          <DocField
            name="slug"
            label="Slug (URL)"
            value={doc.slug}
            errors={errors}
            onValue={(slug) => {
              setSlugTouched(true);
              update({ slug });
            }}
            helperText={`/questions/${doc.format}/${doc.slug || '…'}`}
          />
        </FieldRow>
        <DocField
          name="excerpt"
          label="One-line summary"
          value={doc.excerpt}
          errors={errors}
          onValue={(excerpt) => update({ excerpt })}
          multiline
          minRows={2}
        />
        <FieldRow columns={3}>
          <SelectField label="Difficulty" value={doc.difficulty} options={DIFFICULTY} onValue={(difficulty) => difficulty && update({ difficulty })} />
          <SelectField label="Importance" value={doc.importance} options={IMPORTANCE} onValue={(importance) => importance && update({ importance })} />
          <DocField
            name="duration"
            label="Duration (minutes)"
            type="number"
            value={doc.duration}
            errors={errors}
            onValue={(v) => update({ duration: Math.max(1, Math.round(Number(v) || 0)) })}
            inputProps={{ min: 1 }}
          />
        </FieldRow>
        {doc.format === 'quiz' && (
          <SelectField
            label="Quiz category"
            value={doc.quizCategory}
            options={Object.entries(QUIZ_CATEGORY_LABEL).map(([value, label]) => ({ value: value as NonNullable<QuestionDoc['quizCategory']>, label }))}
            onValue={(quizCategory) => update({ quizCategory })}
            allowEmpty="Choose a category"
          />
        )}
        {doc.format === 'system-design' && (
          <SelectField label="System design type" value={doc.sdType} options={SD_TYPES} onValue={(sdType) => update({ sdType })} allowEmpty="Choose a type" />
        )}
        <TagPicker label="Topics" value={doc.topics} options={topicOptions} onChange={(topics) => update({ topics })} />
        <TagPicker label="Companies" value={doc.companies} options={companyOptions} onChange={(companies) => update({ companies })} />
        <FieldRow>
          <ChipToggles label="Frameworks" options={FRAMEWORKS} value={doc.frameworks} onValue={(frameworks) => update({ frameworks })} />
          <ChipToggles label="Languages" options={LANGUAGES} value={doc.languages} onValue={(languages) => update({ languages })} />
        </FieldRow>
        <SourceFields value={doc.source} onValue={(source) => update({ source })} />
        <TagPicker
          label="References (URLs)"
          value={doc.references}
          options={[]}
          onChange={(references) => update({ references })}
          helperText="Paste a full URL and press Enter."
        />
      </FormSection>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="prompt" label={doc.format === 'quiz' ? 'Prompt (optional)' : 'Prompt'} />
        <Tab value="solution" label={doc.format === 'quiz' || doc.format === 'behavioral' ? 'Answer' : 'Solution write-up'} />
        {coding && <Tab value="code" label="Code & tests" />}
      </Tabs>
      {tab === 'prompt' && (
        <MarkdownEditor label="Prompt" value={doc.prompt} onChange={(prompt) => update({ prompt })} helperText="Markdown. Code blocks, tables and ```mermaid diagrams are supported." />
      )}
      {tab === 'solution' && (
        <MarkdownEditor
          label={doc.format === 'quiz' || doc.format === 'behavioral' ? 'Answer' : 'Solution'}
          value={doc.solution}
          onChange={(solution) => update({ solution })}
          helperText={coding ? 'Explanation shown on the Solution tab. The reference code from "Code & tests" is appended automatically.' : undefined}
        />
      )}
      {tab === 'code' && coding && <CodeFilesEditor files={doc.files} format={doc.format} onChange={(files) => update({ files })} />}
    </>
  );
}
