Build a reusable `Modal` component and use it for a "Delete file?" confirmation.

```jsx
<Modal open={open} onClose={() => setOpen(false)} title="Delete file?" initialFocusRef={cancelRef}>
  …content and buttons…
</Modal>
```

## Requirements

1. When `open` is false, nothing is rendered. When true, render a dimmed **backdrop** and a centred dialog **into `document.body`** through a portal, so parent `overflow` and `z-index` can't clip it.
2. Semantics: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → the title (rendered as a heading), and `aria-describedby` → the body content.
3. **Opening** moves focus into the dialog: to `initialFocusRef` if given, otherwise to the dialog container itself.
4. **Closing** returns focus to whatever was focused before it opened (usually the trigger button).
5. Close with <kbd>Escape</kbd>, by clicking the **backdrop** (but not by clicking inside the dialog), and with a visible close button labelled "Close".
6. The page behind doesn't scroll while the modal is open.
7. Demo: a "Delete file" button opens the dialog. **Cancel** closes it. **Delete** closes it and shows "report.pdf was deleted." For a destructive action, initial focus goes to **Cancel**.

A full focus trap (<kbd>Tab</kbd> cycling inside the dialog) and making the background inert are the subject of *Modal Dialog II*. Mention them, but they aren't required here.

## Follow-up

- What does the native `<dialog>` element with `showModal()` give you for free?
- Why should a backdrop close on `mousedown`/`click` *on the backdrop itself* only? What bug happens when the user drags a text selection out of the dialog?
- How would you stack two modals?
