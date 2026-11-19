Design a reusable **modal dialog component** for a design system. It is used for confirmations ("Delete this
project?"), forms (edit profile), full-screen flows on mobile, and occasionally a dialog opened from within another
dialog.

Requirements:

- Opens over the page with a backdrop; the page behind must not be interactive or scrollable.
- Closes via a close button, `Escape`, and (configurably) clicking the backdrop.
- Focus moves into the dialog on open and returns to where it was on close.
- Supports animations, long scrollable content, and nested/stacked dialogs.
- Must be fully accessible and work on mobile Safari.

Discuss whether to use the native `<dialog>` element, the component API (including an imperative "confirm" helper),
focus management, scroll locking, stacking, and the edge cases.
