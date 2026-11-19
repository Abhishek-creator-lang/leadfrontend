## TL;DR

`createPortal(children, domNode)` renders children **into a different DOM node** (often a container under `document.body`) while keeping them **in the same place in the React tree**. Use it for UI that must **escape the parent's CSS clipping or stacking context**, such as modals, toasts, tooltips, popovers and dropdown menus. Context, state and **synthetic events still flow through the React tree**, not the DOM tree, so a click inside a portal bubbles to React ancestors even though the DOM parent is `body`.

## Example

```jsx
import { createPortal } from 'react-dom';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

Even if `<Modal>` is rendered deep inside a card with `overflow: hidden` and `transform` (which creates a containing block for fixed elements), the dialog appears above everything.

## Why the DOM location matters

- **`overflow: hidden`/`auto`** on an ancestor clips absolutely positioned children.
- **Stacking contexts:** an ancestor with `transform`, `filter`, `opacity < 1` or `z-index` + `position` traps descendants, so no `z-index` can lift them above siblings of that ancestor.
- **`position: fixed`** is relative to an ancestor with `transform`/`filter`, not the viewport.

Portaling to `body` sidesteps all three.

## Event bubbling follows the React tree

```jsx
<div onClick={() => console.log('card clicked')}>
  <Modal open>…</Modal>
</div>
```

Clicking inside the modal logs "card clicked". That's usually convenient (a menu's parent can observe clicks) but can surprise you. Stop propagation inside the portal if needed. Native DOM listeners (`addEventListener`) follow the **DOM** tree instead.

## Accessibility responsibilities

A portal moves DOM, not focus or semantics. For modals you must:

- Move focus into the dialog on open and **return it to the trigger** on close.
- **Trap focus** and close on `Escape`.
- Make background content inert (`inert` attribute on the app root, or `aria-modal` + focus trap).

The native `<dialog>` element with `showModal()` renders in the browser's **top layer**, giving you stacking, inertness and `Escape` handling for free. It's often a better base than a hand-rolled portal modal today, and the Popover API covers many tooltip/menu cases.

## Pitfalls

- **SSR:** `document` doesn't exist on the server. Render portals only after mount, or target a container that's in the server HTML.
- **Container lifecycle:** if you create a container element per portal, clean it up on unmount.
- **Event surprises:** "click outside" handlers using DOM `contains()` treat portal content as outside its React parent. Check both trees or use refs on the portal content.
- **Multiple stacked portals:** manage the order (the latest opened on top) and which one `Escape` closes.

## In an interview, mention…

- Different DOM parent, same React parent: context and synthetic events follow React.
- The CSS reasons (overflow, stacking contexts, fixed positioning).
- Accessibility work: focus management, trapping, inert background.
- Modern alternatives: `<dialog>`, the top layer, and the Popover API.
