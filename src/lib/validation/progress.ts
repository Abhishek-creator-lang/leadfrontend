import { z } from 'zod';

const MAX_NOTE = 20_000;
const MAX_FILE = 100_000;
const MAX_FILES = 30;
const MAX_ITEMS = 5_000;

const id = z.string().min(1).max(200);
const isoDate = z.string().max(40);
const boundedRecord = <T extends z.ZodTypeAny>(value: T) =>
  z.record(id, value).refine((r) => Object.keys(r).length <= MAX_ITEMS, 'Too many entries');

export const noteSchema = z.string().max(MAX_NOTE);

export const draftSchema = z
  .record(z.string().max(200), z.string().max(MAX_FILE))
  .refine((d) => Object.keys(d).length <= MAX_FILES, 'Too many files');

/** Untrusted progress coming from the browser (guest localStorage, Settings → Import). */
export const progressStateSchema = z.object({
  completed: boundedRecord(isoDate).default({}),
  bookmarked: boundedRecord(z.literal(true)).default({}),
  notes: boundedRecord(noteSchema).default({}),
  drafts: boundedRecord(draftSchema).default({}),
  activity: boundedRecord(z.number().int().nonnegative()).default({}),
  recent: z.array(id).max(100).default([]),
  startedPlans: boundedRecord(isoDate).default({}),
});

export type ProgressInput = z.infer<typeof progressStateSchema>;

/** One question's change, mirrored from a store action to the database. */
export const questionPatchSchema = z
  .object({
    completed: z.boolean(),
    bookmarked: z.boolean(),
    note: noteSchema.nullable(),
    draft: draftSchema.nullable(),
    visited: z.literal(true),
  })
  .partial();

export type QuestionPatchInput = z.infer<typeof questionPatchSchema>;
