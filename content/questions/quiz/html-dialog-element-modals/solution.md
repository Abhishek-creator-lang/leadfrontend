## TL;DR

`<dialog>` is a native dialog element, Baseline in all major browsers since 2022. **`dialog.showModal()`** opens it as a **modal**: it's rendered in the **top layer** (above everything, with no z-index battles), the rest of the page becomes **inert** (not clickable, focusable or exposed to screen readers), **focus moves into the dialog**, **Escape closes it**, and a `::backdrop` pseudo-element styles the overlay. When it closes, **focus returns to the element that opened it**. Hand-rolled modals need hundreds of lines and usually still get one of these wrong. `dialog.show()` opens a **non-modal** dialog without any of the inertness.

## Usage

```html
<button id="open">Delete project…</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <form method="dialog">
    <h2 id="confirm-title">Delete “Apollo”?</h2>
    <p>This permanently deletes 42 files.</p>
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

```js
const dlg = document.getElementById('confirm');
document.getElementById('open').addEventListener('click', () => dlg.showModal());

dlg.addEventListener('close', () => {
  if (dlg.returnValue === 'delete') deleteProject();
});
```

```css
dialog::backdrop { background: rgb(0 0 0 / .5); backdrop-filter: blur(2px); }
dialog { max-inline-size: min(32rem, 100% - 2rem); border: none; border-radius: 12px; }
html:has(dialog[open]:modal) { overflow: hidden; } /* prevent background scroll */
```

- **`<form method="dialog">`** closes the dialog on submit and sets `returnValue` to the submit button's `value`, with no JS needed for the close itself.
- The `cancel` event fires on Escape. Call `preventDefault()` to stop it (for example, unsaved changes). Browsers limit repeated cancel prevention to stop abuse.
- **Light dismiss** (click on the backdrop) isn't built in for `showModal()` by default. Newer browsers support a **`closedby="any"`** attribute for it; elsewhere you detect clicks whose target is the dialog element itself.
- Initial focus goes to the first focusable element, or the one with `autofocus`. For destructive confirmations, focus the safe option.

## Modal vs non-modal vs popover

| | `showModal()` | `show()` | `popover` attribute |
|---|---|---|---|
| Top layer | Yes | No | Yes |
| Rest of page inert | Yes | No | No |
| Escape closes | Yes | No | Yes (`auto` popovers) |
| Light dismiss | Opt-in (`closedby`) | No | Yes (`auto`) |
| Use for | Confirmations, forms that block the task | Inline, non-blocking panels | Menus, tooltips, pickers, toasts |

## What you still need to handle

- **Accessible name**: `aria-labelledby` pointing at the heading (or `aria-label`).
- **Scroll lock**: the page behind can still scroll in some cases. Use the `:has()` rule above or `overflow: hidden` on open.
- **Animations**: enter and exit animations need `@starting-style`, `transition-behavior: allow-discrete` and transitions on `overlay` and `display`. Support for these varies, so make them progressive.
- **Focus return** works when you open via a user action. If you open programmatically after navigation, manage focus explicitly.
- **React and frameworks**: control it imperatively via a ref in an effect (`open ? ref.current.showModal() : ref.current.close()`). Setting the `open` attribute directly opens it **non-modally**, which is a common bug.

## Pitfalls

- Using the `open` attribute instead of `showModal()`, which loses inertness and top-layer behaviour.
- Rendering a custom modal inside an ancestor with `transform` or `overflow: hidden`, which clips it or breaks `position: fixed`. The top layer avoids this entirely, which is one reason to switch.
- Forgetting that `display` styles on `dialog` (e.g. `display: flex`) override the hidden state, so the dialog shows even when closed. Scope them to `dialog[open]`.
- Stacking several modals. It works (the newest is on top), but it's usually a UX smell.

## In an interview, mention…

- Top layer, inert background, focus in and focus return, Escape and `::backdrop` as the free features.
- `form method="dialog"` and `returnValue`.
- Modal vs non-modal vs popover, and choosing between them.
- Remaining work: labelling, scroll lock, animations, framework integration.
