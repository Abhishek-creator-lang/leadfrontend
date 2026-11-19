## TL;DR

The **`popover` attribute** turns any element into a popover that the browser shows in the **top layer** (no z-index or overflow clipping problems), with **light dismiss** (click outside or press Escape) and **one-open-at-a-time** behaviour for `popover="auto"`. A button with **`popovertarget`** toggles it **without JavaScript**, and the browser wires up `aria-expanded` and sensible focus behaviour. It's Baseline in all major browsers since 2024. Use it for **non-modal, transient UI**: menus, pickers, tooltips-with-content, toasts and teaching bubbles. Use **`<dialog>` with `showModal()`** when the rest of the page must be blocked.

## Basics

```html
<button popovertarget="account-menu">Account</button>

<div id="account-menu" popover>
  <a href="/profile">Profile</a>
  <a href="/settings">Settings</a>
  <button popovertarget="account-menu" popovertargetaction="hide">Close</button>
</div>
```

```css
[popover] { margin: 0; padding: .5rem; border-radius: 8px; }
[popover]:popover-open { /* open state */ }
[popover]::backdrop { background: transparent; }
```

```js
menu.showPopover(); menu.hidePopover(); menu.togglePopover();
menu.addEventListener('toggle', e => console.log(e.newState)); // "open" | "closed"
```

## Modes

| | `popover` / `popover="auto"` | `popover="manual"` | `popover="hint"` |
|---|---|---|---|
| Light dismiss | Yes | No | Yes |
| Closes other popovers | Yes, other `auto` ones (except ancestors in a nested chain) | No | Closes other hints only |
| Use for | Menus, pickers | Toasts, persistent panels you close in code | Hover/focus tooltips |

`hint` is newer and Chromium-only at the time of writing, so feature-detect it. Nested `auto` popovers (submenus) stay open when the relationship is established through `popovertarget` or DOM nesting.

## Popover vs dialog

| Need | Choose |
|---|---|
| Block the page; the user must respond (confirm delete, sign-in) | `<dialog>` + `showModal()` |
| Transient, dismissible, page stays usable | `popover` |
| Non-modal dialog semantics (a chat panel) | `<dialog popover>` gives dialog role + popover behaviour |

## Positioning

A popover is in the top layer and **centred by default** (via UA styles), not attached to its trigger. To place it next to the button, use **CSS anchor positioning**:

```css
#account-menu {
  position-anchor: --account;
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block;
}
button[popovertarget="account-menu"] { anchor-name: --account; }
```

Anchor positioning shipped in Chromium in 2024 and in Safari 26. Firefox has been the last to arrive, so check current support and keep a JS fallback such as Floating UI where needed.

## Accessibility: what you still own

- The popover has **no implicit role**. Add the right semantics for the pattern: a list of links needs nothing special, while a true `role="menu"` requires arrow-key handling, so prefer the simpler disclosure pattern for navigation.
- Focus isn't automatically moved into an `auto` popover when opened (focus does return to the invoker on light dismiss in many cases). Move focus deliberately for menus and pickers.
- Tooltips: a popover shown on hover must also show on focus, be dismissible with Escape and stay open while hovered (WCAG 1.4.13 Content on Hover or Focus).
- `popovertarget` only works on `<button>` and `<input type="button">`, which is a good nudge toward correct semantics.

## Pitfalls

- Using `popover` for modal flows, so the background stays interactive.
- Forgetting the popover is centred on the viewport until you position it.
- Animating open and close needs `@starting-style` and `transition-behavior: allow-discrete` on `display` and `overlay`. Support varies, so keep animations optional.
- Rendering popovers inside components that re-mount often (lost open state). Keep them stable or control them via `showPopover()`.

## In an interview, mention…

- Top layer, light dismiss, auto vs manual (and hint), and declarative `popovertarget`.
- Popover vs `<dialog>` and when to combine them.
- Anchor positioning and its support status.
- Semantics, focus and keyboard behaviour as your responsibility.
