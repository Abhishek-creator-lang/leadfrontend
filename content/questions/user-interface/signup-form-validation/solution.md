## State design: derive errors, track "touched"

```js
const [values, setValues] = useState(EMPTY);
const [touched, setTouched] = useState({});
const allErrors = validate(values);                    // always correct
const errors = pick(allErrors, touched);               // what the user is allowed to see
```

Errors are **not state**. They're a pure function of values. That removes a whole class of bugs:

- The cross-field rule ("confirm must equal password") updates automatically when *password* changes. No effect, no manual re-validation of the other field.
- No stale errors after programmatic changes (reset, autofill).

`touched` only decides **visibility**: a field starts showing errors after its first blur, and submit marks everything as touched. This gives the "validate on blur, then live" behaviour with almost no code.

`validate` and `PASSWORD_RULES` are exported, framework-free modules. On a real team they live in a shared package (or a Zod/Yup schema) used by both the client and the API, so rules can't drift apart. Client validation is UX; the server must re-validate.

## Password checklist

- The rules are data (`{ id, label, test }`), so the checklist and `validate` use the same source.
- Each item shows a ✓/○ glyph and colour **and** contains visually hidden "(met)"/"(not met)" text, so the state isn't conveyed by colour or a symbol alone (WCAG 1.4.1).
- The input's `aria-describedby="password-rules password-error"` references both the checklist and the error. Screen readers read the rules when the field gets focus.
- Not a live region: announcing every keystroke's rule changes would be very noisy. Users can re-read the description (for example by pressing <kbd>Insert</kbd>+<kbd>Tab</kbd> in NVDA). A middle ground is a polite announcement when *all* rules become met.

## Show-password toggle

- `aria-pressed` makes it a toggle button with a constant label ("Show password, toggle button, pressed"). Alternatively, swap the label ("Show"/"Hide") without `aria-pressed`. Don't combine both.
- It's `type="button"` so it doesn't submit the form, and it applies to both password fields.
- Showing the password is an accessibility feature: it reduces errors for users with dyslexia or motor impairments, and supports WCAG 2.2's *Accessible Authentication*. For the same reason, **never block paste** into password fields. It breaks password managers and pushes users towards weak passwords.

## Submit

Mark every field as touched, compute the errors synchronously from the current values, and focus the first invalid control in DOM order (`form.elements.namedItem`). Don't read `errors` from state after `setTouched`, because it won't be updated until the next render. That's why the handler uses `allErrors`.

## Other a11y and UX details

- `autoComplete="username"`, `"email"` and `"new-password"` let password managers suggest strong passwords and recognise the sign-up form.
- `noValidate` with custom messages, linked via `aria-describedby` and flagged with `aria-invalid`.
- Error messages say how to fix the problem.

## Edge cases

- Username rules: `\w` is ASCII-only. For international usernames use Unicode classes (`/^[\p{L}\p{N}_]{3,20}$/u`) and normalise (NFC) on the server.
- Trim the email but **never** trim passwords; spaces are valid characters.
- Confirm left empty: "don't match" is shown only once it's touched.

## Async username availability

Debounce (about 300 ms) after the local format check passes, cancel the previous request with `AbortController`, ignore out-of-order responses, and show a "Checking…" state with `aria-busy`. Treat the result as advisory, because the server must still enforce uniqueness on submit (race conditions).

## Scaling

At this size hand-rolled state is clear. With dozens of fields, a form library (React Hook Form + Zod resolver) avoids re-rendering the whole form on every keystroke and standardises touched/dirty/error handling. The concepts are the same.

## Follow-ups

- **Password strength meter:** zxcvbn-style scoring beats composition rules (NIST 800-63B recommends length and breached-password checks over "must contain a number").
- **Multi-step sign-up:** validate per step and keep values in a parent or a reducer.
