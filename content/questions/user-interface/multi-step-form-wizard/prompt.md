Build a three-step **sign-up wizard**:

1. **Account**: Email, Password
2. **Profile**: Full name, Role (select: Engineer, Designer, Manager), and a "Send me product updates" checkbox
3. **Review**: a summary of everything entered, each section with an **Edit** button, and a **Create account** button

The starter renders all fields of step 1 and a **Next** button, with no logic.

## Requirements

1. **Navigation:** **Next** validates only the current step and advances if it's valid. **Back** returns to the previous step **without losing** any values. Review has no Next. It submits instead.
2. **Validation rules:**
   - Email is required and must look like an email (`Enter a valid email address`).
   - Password is required and at least 8 characters.
   - Full name and Role are required.
   - Show errors under each field only after the user tries to continue. After that, errors update as the user types.
3. **Progress indicator:** an ordered list of the three steps showing the current one (`aria-current="step"`). Completed steps are buttons that jump back to them. Future steps aren't clickable.
4. **Submit:** **Create account** calls `onSubmit(values)`, which returns a Promise. While it's pending, the button reads `Creating…` and can't be pressed again. On success, show `Account created for <email>`.
5. **Accessibility:**
   - Every input has a `<label>`. Invalid fields get `aria-invalid="true"` and `aria-describedby` pointing at their error message.
   - When Next fails, focus moves to the **first invalid field**.
   - When the step changes, focus moves to the new step's heading, so screen-reader users hear where they are, for example "Step 2 of 3: Profile".
   - Pressing <kbd>Enter</kbd> in a field behaves like **Next**, because each step is a real `<form>`.

## Follow-up

- Persist the draft so a refresh doesn't lose it. What must **not** be persisted?
- Step 2's options depend on an API call. Where does that fetch live?
- How would you make the steps configurable (a schema-driven wizard)?
