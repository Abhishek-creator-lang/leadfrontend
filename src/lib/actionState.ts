import type { FieldErrors } from './validation/auth';

/** What a form Server Action returns to `useActionState`. */
export interface ActionState {
  /** Set when the action succeeded (and did not redirect). */
  ok?: boolean;
  /** A message for the whole form (success or error, see `ok`). */
  message?: string;
  /** Per-field validation errors; `form` holds a non-field error. */
  errors?: FieldErrors;
  /** Submitted values echoed back so inputs keep their text after an error (never passwords). */
  values?: Record<string, string>;
  /** Login only: the account exists but its email is not confirmed yet. */
  unverifiedEmail?: string;
}

export const initialActionState: ActionState = {};

/** Reads string fields from FormData, skipping files. */
export const formValues = (form: FormData, keys: string[]) =>
  Object.fromEntries(
    keys.map((k) => [k, typeof form.get(k) === 'string' ? (form.get(k) as string) : ''])
  );
