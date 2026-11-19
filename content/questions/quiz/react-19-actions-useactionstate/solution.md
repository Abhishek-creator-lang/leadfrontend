## TL;DR

In React 19, an **Action** is an **async function run inside a transition**, usually to mutate data. React tracks it for you: **pending state**, **errors**, **optimistic updates**, and **sequencing**. `<form action={fn}>` calls `fn(formData)` as an Action and **resets uncontrolled fields** on success. **`useActionState(action, initialState)`** wraps an action so you get `[state, dispatchAction, isPending]`, where `state` is whatever the action last returned (results, validation errors). **`useFormStatus()`** (from `react-dom`) lets a component *inside* a form read its `pending` status and submitted data. That's ideal for submit buttons. Together they replace most hand-written `isLoading`/`error` state for mutations, and they work with Server Functions for progressive enhancement.

## Before vs after

```jsx
// Before: manual pending and error state
function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  async function handleSubmit() {
    setIsPending(true);
    const err = await updateName(name);
    setIsPending(false);
    if (err) setError(err);
  }
  // ...
}
```

```jsx
// React 19
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

async function updateNameAction(prevState, formData) {
  const name = formData.get('name');
  if (!name) return { error: 'Name is required' };
  const err = await updateName(name);
  return err ? { error: err.message } : { error: null, saved: name };
}

function UpdateName() {
  const [state, formAction, isPending] = useActionState(updateNameAction, { error: null });
  return (
    <form action={formAction}>
      <input name="name" aria-invalid={!!state.error} />
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
      {state.saved && <p>Saved as {state.saved}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus(); // reads the nearest parent <form>
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

## Key semantics

- **Signature:** the action passed to `useActionState` receives `(previousState, payload)`. When it's used as a form action, the payload is `FormData`.
- **Sequential:** calls to the dispatched action are **queued** and run one after another, each receiving the previous result.
- **Transitions:** async functions passed to `startTransition` are Actions too (React 19). `isPending` stays true until the whole async function finishes. Note: state updates *after* an `await` must be wrapped in another `startTransition` to be part of the transition, a known limitation.
- **Errors:** a throwing action propagates to the nearest **error boundary**. For expected failures (validation), **return** error state instead of throwing.
- **Form reset:** after a successful `<form action>`, uncontrolled inputs reset. Use `requestFormReset` for manual control. Controlled inputs are unaffected.
- **`useFormStatus`** must be called from a component **rendered inside** the `<form>`, not in the component that renders the form.
- **`formAction` prop** on `<button>`/`<input type="submit">` lets different buttons trigger different actions.

## Server Functions and progressive enhancement

With a framework supporting RSC, the action can be a `'use server'` function. `useActionState(serverFn, initial, permalink)` lets the form **submit and work before JavaScript has loaded**, and React hydrates the returned state. Treat server functions as public endpoints: validate and authorize.

## Pairing with optimistic UI

Combine with `useOptimistic` to show the expected result immediately while the action runs, with automatic rollback when it ends.

## Version notes

`useActionState` was briefly named `useFormState` (in `react-dom`) in canary releases. React 19 renamed it and moved it to `react`, adding `isPending`.

## In an interview, mention…

- Action = async transition, with pending, error and optimistic handling built in.
- The `useActionState` signature (`prevState`, `payload`), queued execution, and returning errors rather than throwing for validation.
- `useFormStatus` must be inside the form. Uncontrolled fields reset automatically.
- Progressive enhancement with Server Functions, and their security implications.
