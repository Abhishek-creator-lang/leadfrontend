## Component API

```jsx
<Modal open onClose title initialFocusRef>{children}</Modal>
```

The modal is **controlled**: the parent owns `open`, and the modal *requests* closing through `onClose`. That lets the parent veto a close (unsaved changes), run side effects, or animate out. The modal itself never sets its own visibility.

## Portal

`createPortal(…, document.body)` renders the dialog outside the app's DOM tree, so an ancestor's `overflow: hidden`, `transform` (which creates a new containing block for `position: fixed`) or stacking context can't clip it. React context and event bubbling still follow the **React** tree, so a click inside the portal bubbles to React ancestors even though the DOM parent is `body`. That's a well-known gotcha.

## Semantics

| Attribute | Why |
|---|---|
| `role="dialog"` | Screen readers announce "dialog" and switch to application browsing where appropriate |
| `aria-modal="true"` | Tells assistive tech that content outside is inert, so virtual cursors stay inside (supported in modern screen readers) |
| `aria-labelledby` → `<h2>` | The dialog's name: "Delete file?, dialog" |
| `aria-describedby` → body | The description is read on open, which is useful for short confirmations |

IDs come from `useId`.

## Focus management

1. **On open**, focus moves into the dialog. Without that, keyboard and screen-reader users stay on the page behind it. For a destructive confirmation, APG suggests focusing the **least destructive** action (Cancel). For a form, focus the first field. For long content, focus the dialog container (`tabIndex={-1}`) or the heading, so the start of the content is read.
2. **On close**, return focus to the element that opened it. That's stored as `document.activeElement` when the effect runs, and restored in the cleanup only if it's still connected (the trigger might have been removed, as in "delete row"). Otherwise focus a sensible fallback.

The effect depends only on `open` (and the ref). `onClose` is read through a "latest ref", so a parent re-render with a new inline `onClose` doesn't tear down the effect, which would steal and restore focus on every render.

## Dismissal

- **Escape:** a `keydown` listener on `document` while open. `stopPropagation` prevents an outer component (another modal, a menu) from also handling it.
- **Backdrop:** close only if the **press started and ended** on the backdrop (`e.target === e.currentTarget` for both mousedown and click). If you only check `click`, selecting text inside the dialog and releasing the mouse over the backdrop fires a click on the backdrop and closes the dialog unexpectedly.
- **Close button:** a visible "×" with `aria-label="Close"`. Keyboard users need a discoverable control, not only Escape.

## Scroll lock

`body { overflow: hidden }` while open, restoring the *previous* value on close rather than blindly resetting it. Production details: compensate for the scrollbar width (`padding-right`) to avoid a layout shift, and iOS Safari may need `position: fixed` on the body with the scroll position saved and restored.

## What's still missing (Modal Dialog II)

- **Focus trap:** <kbd>Tab</kbd> from the last control should wrap to the first. Right now it escapes to the page behind.
- **Inert background:** set `inert` (or `aria-hidden` as a fallback) on the app root so screen-reader virtual cursors and clicks can't reach it.

## Native `<dialog>`

`dialog.showModal()` gives you top-layer rendering (no portal or z-index issues), an inert background, Escape to close (the `cancel` event), `::backdrop` styling, and focus moved in on open, all built in. Returning focus on close is handled in current browsers. Caveats: closing on a backdrop click still needs code, it's harder to animate open and close (`@starting-style`, `allow-discrete` transitions), and some test environments (jsdom) don't implement it. For a new design system, building on `<dialog>` is the modern recommendation.

## Follow-ups

- **Stacking modals:** keep a stack (context or a module-level array). Only the top modal handles Escape and owns the scroll lock, which is released when the stack empties.
- **Exit animation:** keep it mounted in a `closing` state until `animationend`, then unmount.
- **Testing:** query `getByRole('dialog', { name })`, and assert `document.activeElement` on open and close.
