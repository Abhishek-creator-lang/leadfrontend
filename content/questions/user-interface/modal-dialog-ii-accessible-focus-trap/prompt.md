The starter contains a working modal from *Modal Dialog*: a portal, `role="dialog"`, Escape to close and focus restoration. Its focus can still escape, though. Pressing <kbd>Tab</kbd> past the last button lands on the page behind the overlay, and screen-reader users can browse the background freely.

Make it a **true modal**.

## Requirements

1. **Focus trap:** <kbd>Tab</kbd> on the last focusable element inside the dialog moves to the first. <kbd>Shift</kbd>+<kbd>Tab</kbd> on the first moves to the last. If focus somehow lands outside the dialog while it's open (a programmatic `focus()` or a click), pull it back in.
2. **Inert background:** while open, every other child of `<body>` gets the `inert` attribute, so it can't be clicked, focused or reached by a screen reader's virtual cursor. Remove exactly the attributes you added when it closes. Don't remove an `inert` someone else set.
3. **Initial focus:** `initialFocusRef` if given, otherwise the first focusable element, otherwise the dialog container.
4. Keep everything from Part I: Escape, the close button, focus returns to the trigger, scroll lock, `aria-modal`/`aria-labelledby`.
5. "Focusable" means: not disabled, not `tabindex="-1"`, and not hidden.
6. Demo: an **Edit profile** dialog with Name and Email inputs, **Cancel** and **Save**. Initial focus goes to Name. Save updates the profile shown on the page.

## Follow-up

- Why is `inert` better than `aria-hidden="true"` on the background? What was the old workaround?
- How do nested modals (a confirm inside an edit dialog) interact with the trap and the inert background?
- What does `<dialog>.showModal()` do here for free?
