## What makes a modal *modal*

Part I made the dialog look modal. For keyboard and screen-reader users, the rest of the page was still fully reachable. A real modal needs three guarantees:

1. **Keyboard focus can't leave** (focus trap).
2. **Pointer and assistive tech can't reach the background** (inert).
3. **Focus is placed deliberately** on open and restored on close.

## Focus trap

```js
if (event.shiftKey && (active === first || active === dialog)) { e.preventDefault(); last.focus(); }
else if (!event.shiftKey && active === last) { e.preventDefault(); first.focus(); }
```

- We intercept <kbd>Tab</kbd> **only at the edges**. In the middle, the browser's native tab order applies, which respects DOM order and any custom widgets. Re-implementing every Tab press is fragile.
- The focusable list is computed **on each keypress**, not on open. Content inside the dialog changes (validation messages, disabled buttons, async content), and a cached list goes stale.
- "Focusable" is a filtered selector: links with `href`, enabled form controls, `[tabindex]` elements with `tabIndex >= 0`, excluding anything `hidden` or inside `[inert]`/`[hidden]`. A production version also excludes `display: none` and `visibility: hidden` (check `el.getClientRects().length` and computed visibility), and handles radio groups (only the checked radio is a tab stop) and shadow DOM.
- The container counts as "first" for Shift+Tab, which covers the case where the dialog itself holds focus.
- With **no** focusable children, Tab keeps focus on the dialog container.
- **`focusin` safety net:** if something calls `.focus()` on a background element, or a browser feature moves focus, we pull it back. The Tab handler alone can't catch that.

## Inert background

Every other child of `<body>` gets `inert` while the modal is open:

- `inert` removes elements from the tab order, blocks clicks, and hides them from the accessibility tree, all in one attribute. It's supported in all modern browsers.
- The old workaround was `aria-hidden="true"` on the app root (hides from AT only) **plus** a focus trap (for keyboard) **plus** the backdrop (for mouse). Three mechanisms to keep consistent. `aria-hidden` alone is dangerous: focusable elements inside an `aria-hidden` subtree can still receive focus and are then announced as nothing.
- The portal renders into **its own container** appended to `body`, so we can make every *sibling* inert without touching the dialog.
- The undo function removes `inert` only from elements **we** changed. If another component (another modal, a drawer) already made something inert, we leave it alone. That's what makes stacking work.

`aria-modal="true"` is still set. It's the semantic hint, and `inert` is the enforcement.

## Why `useLayoutEffect`

Making the background inert and moving focus happen before the browser paints, so there's no frame where the dialog is visible but focus is still on the page behind, and no flash of an interactive background. (SSR note: `useLayoutEffect` warns on the server. Guard it, or render the modal client-only.)

## Focus placement

- Order of preference: an explicit `initialFocusRef` (here the Name field, because the user came to edit), then the first focusable element, then the container.
- On close, restore focus to the element that opened the dialog, if it's still connected.

## Nested modals

Opening a confirmation inside the edit dialog: the inner modal's container is appended last, and it makes all its siblings inert, *including the outer modal's container*. The outer trap's `focusin` listener would fight the inner one, so production implementations keep a **modal stack**: only the top modal's listeners act (check `stack.at(-1) === this`), and Escape closes only the top one. Because each modal undoes only its own `inert` changes, closing the inner one re-enables exactly the outer one.

## Native `<dialog>.showModal()`

It gives you the top layer, an inert background (the spec makes everything outside the modal dialog inert), Escape to cancel, initial focus and, in current browsers, focus restoration on close. It does **not** trap Tab at the boundary in the classic sense: focus can move to browser chrome (the address bar), which is considered correct behaviour. A custom trap that prevents reaching the browser UI is arguably worse. For new work, prefer `<dialog>`, and know this implementation for legacy support and interviews.

## Testing

- jsdom doesn't move focus on Tab, so the tests dispatch `keydown` Tab at the edges and assert on `document.activeElement`, which is exactly the code path our handler owns.
- `inert` has no behaviour in jsdom, so assert the attribute on the background root and its removal after close.
- In a real browser, add a Playwright test pressing Tab N+1 times to confirm the wrap-around with native focus order.
