---
title: Forms
description: Controlled vs uncontrolled inputs, validation, accessibility, form libraries, and React 19 form Actions with useActionState and useFormStatus.
source: original
---
Forms are where React meets the browser's oldest features, and where many UI coding rounds take place: signup forms, multi-step checkouts, editable tables. Interviewers check whether you can manage input state, validate well, keep forms accessible, and choose the right level of tooling. Since React 19, there's also a new built-in model for form submission to know about.

## Controlled vs uncontrolled

| | Controlled | Uncontrolled |
| --- | --- | --- |
| Source of truth | React state | The DOM |
| API | `value` + `onChange` | `defaultValue` + `ref` or `FormData` |
| Re-render per keystroke | Yes | No |
| Instant validation and formatting | Easy | Harder |
| Simplicity for submit-only forms | More code | Less code |

```tsx
// Controlled
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />

// Uncontrolled, read on submit
function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const email = String(data.get('email'));
}
<form onSubmit={onSubmit}><input name="email" defaultValue="" /></form>
```

**A common bug:** switching an input between controlled and uncontrolled (`value={maybeUndefined}`). React warns. Always pass a defined value (`value={x ?? ''}`).

**Guidance:** use controlled inputs when the UI reacts to each keystroke (live validation, formatting, dependent fields). Use uncontrolled inputs and `FormData` when you only need values on submit. Large forms with many controlled fields can re-render heavily, which is one reason form libraries exist.

## A solid controlled form for an interview

```tsx
type Values = { email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.email = 'Enter a valid email';
  if (v.password.length < 8) errors.password = 'At least 8 characters';
  return errors;
}

function SignupForm({ onSubmit }: { onSubmit: (v: Values) => Promise<void> }) {
  const [values, setValues] = useState<Values>({ email: '', password: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const errors = validate(values); // derived, not stored

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Email" name="email" type="email" value={values.email}
        error={touched.email ? errors.email : undefined}
        onChange={handleChange} onBlur={handleBlur} autoComplete="email" />
      <Field label="Password" name="password" type="password" value={values.password}
        error={touched.password ? errors.password : undefined}
        onChange={handleChange} onBlur={handleBlur} autoComplete="new-password" />
      {serverError && <p role="alert">{serverError}</p>}
      <button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create account'}</button>
    </form>
  );
}

function Field({ label, name, error, ...props }: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...props} />
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}
```

Signals in this code: derived errors (not stored), showing errors only after touch or submit, `useId` for label association, `aria-invalid` and `aria-describedby`, `autoComplete` attributes, a server error announced with `role="alert"`, and prevention of double submits.

## Validation strategy

| Layer | Purpose |
| --- | --- |
| Native constraints (`required`, `type`, `minLength`, `pattern`) | Free baseline, mobile keyboards, works before JS loads |
| Client schema (Zod, Valibot, Yup) | Rich rules, type inference, shared with the server |
| Server validation | **Always required.** The client can be bypassed. |

**When to show errors:** on blur for format errors, on submit for required fields, and live re-validation once a field has been flagged. Avoid shouting "invalid email" while the user is still typing their first character.

**After a failed submit:** move focus to the first invalid field or to an error summary at the top that links to each field.

## Accessibility checklist

- [ ] Every input has a visible `<label>` associated via `htmlFor`/`id` (placeholder is not a label)
- [ ] Group related controls with `<fieldset>` and `<legend>` (radio groups, addresses)
- [ ] Errors are linked with `aria-describedby` and flagged with `aria-invalid`
- [ ] Required fields are indicated in text, not just with color or an asterisk
- [ ] Submission results are announced (`role="status"` for success, `role="alert"` for errors)
- [ ] Logical tab order; no positive `tabIndex`
- [ ] Use correct `type` and `autoComplete` values (`email`, `tel`, `one-time-code`, `current-password`)
- [ ] Don't disable the submit button with no explanation. Many teams prefer keeping it enabled and showing errors on submit.

## Form libraries

| Library | Model | Strengths |
| --- | --- | --- |
| React Hook Form | Uncontrolled inputs registered via refs | Minimal re-renders, small, schema resolvers, great for large forms |
| TanStack Form | Headless, type-safe, framework-agnostic | Fine-grained reactivity, strong TypeScript, async validation |
| Formik | Controlled | Older and widely used; less active than the alternatives |
| Conform | Progressive enhancement with server actions | Works with React 19 Actions and Remix/Next |

Use a library when you have many fields, dynamic field arrays, complex cross-field validation, or performance issues. Skip it for a three-field login form.

## React 19: Actions for forms

React 19 lets you pass a function to `<form action={fn}>`. React calls it with the `FormData`, wraps it in a transition, and resets uncontrolled fields after a successful submit.

### `useActionState`

```tsx
async function updateName(prevState: { error?: string } | null, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required' };
  try {
    await api.updateName(name);
    return null;
  } catch {
    return { error: 'Could not save. Try again.' };
  }
}

function NameForm() {
  const [state, formAction, isPending] = useActionState(updateName, null);
  return (
    <form action={formAction}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" aria-describedby={state?.error ? 'name-error' : undefined} />
      {state?.error && <p id="name-error" role="alert">{state.error}</p>}
      <button disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
```

(`useActionState` was briefly named `useFormState` in React DOM canaries. The final React 19 API is `useActionState` from `react`.)

### `useFormStatus`

Reads the pending state of the **parent** form, which is handy in design-system submit buttons:

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{children}</button>;
}
```

It must be rendered *inside* the `<form>`. It doesn't read the status of a form rendered in the same component.

### Server Functions (`'use server'`)

In RSC frameworks, the action can be a Server Function, so the form works **before JavaScript loads** (progressive enhancement) and can then be enhanced on the client. Always validate and authorize on the server. Server Functions are public endpoints.

### `useOptimistic` with forms

Show the expected result immediately while the action runs, such as a new message appearing in a chat with a "sending" state.

## Multi-step forms

- Keep all step data in one reducer (or form library instance) above the steps.
- Validate each step before advancing. Keep a summary step for review.
- Persist drafts to `sessionStorage` or `localStorage` to survive reloads.
- Consider putting the step in the URL so back/forward works.
- Move focus to the step heading on step change, and announce progress ("Step 2 of 4").

## Common interview follow-ups

1. How would you handle a 200-field form performantly? (Uncontrolled inputs, React Hook Form, field-level subscriptions, splitting sections.)
2. How do you prevent double submission? (Pending state, idempotency keys on the server.)
3. How do you share validation between client and server? (A shared Zod schema.)
4. How do you warn about unsaved changes? (Dirty tracking plus `beforeunload` and router blockers.)
5. What changes with React 19? (Form Actions, `useActionState`, `useFormStatus`, automatic reset of uncontrolled forms.)
