Build a "Contact us" form with **Name**, **Email** and **Message** fields. The starter has a fake `sendMessage(data)` that resolves after about 400 ms.

## Requirements

1. **Validate on submit** (in JavaScript, so add `noValidate` to the form):
   - Name is required.
   - Email is required and must look like an email.
   - Message is required and must be at least 10 characters.
2. Show each error **under its field**. Mark invalid fields with `aria-invalid="true"` and link the error with `aria-describedby`.
3. On a failed submit, **move focus to the first invalid field**.
4. Once a field has an error, re-validate it as the user types, so the error disappears as soon as it's fixed.
5. While sending, disable the submit button and change its text to "Sending…".
6. On success, replace the form with a thank-you message ("Thanks, Ada! We'll reply to ada@example.com soon.") in a `role="status"` region, with a "Send another message" button that brings back an empty form.
7. Every field has a visible `<label>`.

## Follow-up

- Native constraint validation (`required`, `type="email"`) or custom JavaScript validation?
- Validate on blur, on change, or on submit? What's the best UX?
- How would you handle a server-side validation error (for example "This email is blocked")?
