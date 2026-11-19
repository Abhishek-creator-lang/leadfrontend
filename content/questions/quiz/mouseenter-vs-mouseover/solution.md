## TL;DR

**`mouseover` bubbles** and fires again every time the pointer moves onto the element **or any of its descendants**. **`mouseenter` does not bubble** and fires **once** when the pointer enters the element's box, ignoring movement between its children. The same pairing exists for `mouseout`/`mouseleave`. For hover logic on a single element you almost always want `mouseenter`/`mouseleave` (or `pointerenter`/`pointerleave`).

## Demonstration

```html
<div id="card">
  <h3>Title</h3>
  <p>Body text</p>
</div>
```

```js
let over = 0, enter = 0;
card.addEventListener('mouseover', () => console.log('over', ++over));
card.addEventListener('mouseenter', () => console.log('enter', ++enter));
```

Move the pointer into `#card`, then across the `<h3>` and `<p>`:

- `mouseenter` logs **once**.
- `mouseover` logs on entering the card, again on entering `<h3>` (fired on `<h3>`, bubbles to the card), again when moving to `<p>`, and even when moving from a child back onto the card's own padding.

## Key differences

| | `mouseover` / `mouseout` | `mouseenter` / `mouseleave` |
|---|---|---|
| Bubbles | Yes | No |
| Fires when moving between children | Yes | No |
| `e.target` | The innermost element entered | Always the element the listener is on |
| Works with event delegation | Yes | Not directly (use capture or `mouseover`) |
| `relatedTarget` | Element the pointer came from / goes to | Same |

## When to use each

- **`mouseenter`/`mouseleave`:** tooltips, hover cards and highlight effects bound to a specific element. You get exactly one enter and one leave, so there is no flicker and no need for guards.
- **`mouseover`/`mouseout`:** **delegation**. One listener on a table or list can track which row is hovered via `e.target.closest('tr')`. To emulate enter/leave semantics here, ignore events whose `relatedTarget` is still inside the same row:

```js
table.addEventListener('mouseover', (e) => {
  const row = e.target.closest('tr');
  if (!row || row.contains(e.relatedTarget)) return; // moved within the row
  highlight(row);
});
```

## Pitfalls and modern notes

- Prefer **Pointer Events** (`pointerenter`, `pointerover`, …). They have the same bubbling difference but unify mouse, pen and touch, and are what you should build hover/press interactions on today.
- Touch devices have no hover. Browsers emulate mouse events after a tap, so hover-only UIs (menus that open on `mouseenter`) are inaccessible on touch and to keyboard users. Always pair them with click/focus handling, and in CSS consider `@media (hover: hover)`.
- If the DOM under the cursor changes (an element is removed or inserted), browsers may fire enter/leave or over/out events without the pointer moving. Don't assume they only follow user motion.
- Pure visual hover effects belong in CSS `:hover`, not JS.

## In an interview, mention…

- Bubbling is the root difference; everything else (repeat firing, delegation support) follows from it.
- `relatedTarget` is the tool for filtering inner moves with `mouseover`.
- Pointer events, touch and keyboard accessibility: hover should never be the only way to reach content.
