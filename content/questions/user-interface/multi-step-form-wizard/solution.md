## Architecture

```
Wizard
├─ <nav> progress: <ol> with aria-current="step"; completed steps are buttons
├─ step 0 <form onSubmit={next}>     Email, Password
├─ step 1 <form onSubmit={next}>     Full name, Role, Updates
└─ step 2 <form onSubmit={submit}>   Review (dl per section + Edit) → onSubmit(values)
validateStep(step, values)           pure, unit-testable
```

## State design

| State | Why |
|---|---|
| `values`: one object for **all** steps | Back and Edit never lose data. If each step owned its own state, unmounting a step would throw its values away. |
| `step` | The index of the current step |
| `attempted`: `Set<step>` | Errors are *shown* only after the user tries to continue (no shouting at people before they've typed) |
| `submit`: `{ status, error }` | `idle → pending → done \| error` |

**Errors are derived**, not stored: `attempted.has(step) ? validateStep(step, values) : {}`. After a failed Next, the messages update live as the user fixes fields, without any extra `onChange` validation code and without stale error state.

The same `validateStep` runs in `next()` to decide whether to advance and which field is first invalid (`STEP_FIELDS` gives the visual order). It's pure, so it's trivially unit-testable and shareable with the server (for example, as a zod schema in a real app).

## Accessibility

- **Real `<form>` per step:** <kbd>Enter</kbd> in any field submits, which means Next. `noValidate` turns off the native validation bubbles so you control the messaging, while keeping `type="email"` for mobile keyboards and `autocomplete` tokens (`email`, `new-password`, `name`) for password managers and autofill.
- **Error association:** `aria-invalid="true"` and `aria-describedby` → the error `<p>`, so screen readers read "Email, invalid entry, Email is required". Errors are shown with text and an icon, not just a red border.
- **Focus on failure:** moves to the first invalid field (WCAG 3.3.1 *Error Identification*). For long forms, an error summary at the top with links to each field is the GOV.UK-style alternative.
- **Focus on step change:** the heading "Step 2 of 3: Profile" gets `tabIndex={-1}` and is focused. Without this, focus stays on a Next button that no longer exists and falls to `<body>`, and screen-reader users don't know the content changed. This is skipped on first render so the page doesn't steal focus on load.
- **Progress:** an ordered list inside a labelled `<nav>`, with `aria-current="step"` on the current one. Completed steps are real buttons with "(completed)" in their accessible name. Future steps are plain text, because jumping ahead would skip validation.
- **Review:** `<dl>` pairs. "Edit" buttons include hidden context ("Edit profile") so a list of buttons isn't five identical "Edit"s. The password is masked.
- **Submitting:** `aria-disabled` plus a guard instead of `disabled`, so focus isn't lost from the button. The label changes to "Creating…". Success is rendered in a `role="status"` container, and errors use `role="alert"`.

## Edge cases

- **Double submit:** the `pending` guard drops the second click (and `Enter` key repeats).
- **Unmount during submit:** the `mounted` ref prevents state updates. With `fetch`, pass an `AbortSignal` instead.
- **Trimming:** emails and names are trimmed for validation and submission. Passwords are **not** trimmed, because spaces can be intentional.
- **Going back after Review:** values persist, and earlier steps stay valid unless edited. A robust implementation re-validates *all* steps on submit in case a value was changed through Edit.

## Productionising

- **Draft persistence:** save `values` (minus the password) to `sessionStorage` on change (debounced), and restore on mount. **Never persist secrets** in web storage. Also sync the step to the URL (`?step=profile`) so the browser Back button and refreshes work, while still guarding against deep links to steps whose prerequisites aren't valid.
- **Schema-driven wizards:** describe steps as data (`{ id, title, fields: [{ name, type, rules }] }`), render fields from a registry, and validate with a schema library. Conditional steps become `when: (values) => boolean`.
- **Async dependencies:** if step 2's role list comes from an API, fetch it when the wizard mounts (or prefetch on step 1), cached in a server-state library, with loading and error states inside step 2.
- **Server errors:** map field-level errors from the API (`409 email taken`) back to `{ email: '…' }`, jump to that field's step, and focus it.
- **Analytics:** track step views and drop-offs to find the step that loses users.

## Follow-ups

- *"Why not one big form with sections shown and hidden?"* That's possible: keep every field mounted and toggle visibility. But per-step forms give natural Enter-to-advance and scoped validation.
- *"Controlled vs uncontrolled?"* Controlled, because Review and live re-validation read the values on every render. A form library (React Hook Form) uses uncontrolled inputs plus subscriptions for performance on large forms.
