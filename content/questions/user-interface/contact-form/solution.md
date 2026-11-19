## State design

| State | Purpose |
|---|---|
| `values` | One object for all fields. A single `handleChange` uses `event.target.name`. |
| `errors` | `{ field: message }`. A field is valid when it has no key. |
| `status` | `'idle' \| 'sending' \| 'sent'`. One status value instead of `isSending` and `isSent` booleans, which can't contradict each other. |

Validation is a **pure function** `validate(values) → errors`. It's easy to unit test and can be shared with the server (same rules, different runtime), and on submit and on change it's the same call.

## When to validate

The UX rule used here is: **reward early, punish late**.

- No errors while the user is still filling a field for the first time. Errors on every keystroke are hostile.
- On submit, validate everything.
- Once a field shows an error, re-validate it on change so the message disappears as soon as it's fixed.

Validating on blur is a reasonable alternative for format checks. Avoid it for "required" errors, since tabbing through an empty form would light everything up red.

## Accessibility

- Every control has a visible `<label htmlFor>`. Placeholders aren't labels.
- `noValidate` turns off native bubbles, which are inconsistent, unstylable and sometimes not announced. We implement the equivalent:
  - `aria-invalid="true"` on invalid fields. Screen readers say "invalid entry".
  - `aria-describedby` points at the error text, so it's read when the field gets focus.
  - **Focus the first invalid field** on submit. The user lands right on the problem and hears its label and error.
- Error text is specific and actionable ("Enter an email address like name@example.com"), not just "Invalid". An icon (`⚠`) plus text plus a red border: never colour alone.
- For long forms, add an **error summary** at the top (a list of links to each field) and focus it on submit. That's the GOV.UK pattern.
- The success message is in `role="status"`. The heading stays, so the page doesn't lose context.
- `autoComplete="name"` and `"email"` help autofill and users with motor or cognitive disabilities (WCAG 1.3.5).

## Native validation vs JavaScript

Native `required` and `type="email"` are free, run before submit and work without JavaScript. Keep them as progressive enhancement if the form can submit without JavaScript. Custom JavaScript validation wins for consistent styling and messages, cross-field rules (confirm password) and async checks. A hybrid approach is fine too: use the Constraint Validation API (`input.validity`, `setCustomValidity`) and render its messages yourself.

## Edge cases

- Trim values before checking and before sending. "   " isn't a name.
- The email regex is deliberately loose. Fully RFC-compliant validation is impossible with a regex, and the real check is sending a confirmation email.
- Double submit: the button is disabled while sending, and the handler also bails out if `status === 'sending'`.
- A server failure isn't modelled by the fake API. In production, wrap the call in `try/catch`, return to `idle`, keep the values and show a form-level `role="alert"`. Map server field errors (`{ email: 'blocked' }`) into `errors` and focus the field.
- Unmount mid-request: use an `AbortController` or ignore the late result.

## Scaling it

- For many forms, use a form library (React Hook Form uses uncontrolled inputs and refs for performance, and integrates with schema validators like Zod) or React 19 actions (`useActionState`). The principles above stay the same.
- Share the validation schema between client and server so the rules never drift apart.
- Add spam protection (a honeypot field, rate limiting) on the server.

## Follow-ups

- **Character counter for the message:** show "120/500" and announce it politely only near the limit.
- **Testing:** `getByLabelText` doubles as an accessibility test: if it can't find the field, neither can a screen-reader user.
