Build a sign-up form with **Username**, **Email**, **Password** and **Confirm password**.

## Rules

| Field | Rule | Message |
|---|---|---|
| Username | 3–20 characters: letters, numbers, underscores | "Use 3–20 letters, numbers or underscores." |
| Email | Required, looks like an email | "Enter a valid email address." |
| Password | At least 8 characters, at least one letter, at least one number | (checklist, see below) |
| Confirm password | Same as Password | "Passwords don't match." |

## Requirements

1. Validate a field when it **loses focus** (blur), and re-validate it on every change after that. Untouched fields show no errors.
2. On **submit**, validate everything, show all errors, and focus the first invalid field.
3. Below the password, show a **live checklist** of its three rules. Each item visibly shows met or unmet, and screen readers hear the state too (not just a colour or tick). Link the checklist to the password input with `aria-describedby`.
4. Changing **Password** re-checks **Confirm password** if it was already touched.
5. A **Show password** toggle button switches the password input between `type="password"` and `type="text"`. It uses `aria-pressed`.
6. Errors use `aria-invalid` and `aria-describedby`, as in an accessible form.
7. On a valid submit, replace the form with "Welcome, <username>!" in a `role="status"` element.

## Follow-up

- Where should validation rules live so the server uses the same ones?
- How would you check username availability against an API as the user types?
- Why shouldn't you block pasting into password fields?
