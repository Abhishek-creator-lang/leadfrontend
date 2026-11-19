## TL;DR

They control two independent things. **`preventDefault()`** cancels the **browser's default action** (navigating, submitting, checking a box) but the event **keeps propagating** to other listeners. **`stopPropagation()`** stops the event **travelling to further nodes** in the capture/bubble path, but the **default action still happens**. **`stopImmediatePropagation()`** additionally skips the remaining listeners **on the current element**. Use them together only when you need both effects.

## Side by side

```html
<div id="card">
  <a id="link" href="/details">Details</a>
</div>
```

```js
card.addEventListener('click', () => console.log('card clicked'));

link.addEventListener('click', (e) => {
  e.preventDefault();   // no navigation
  // 'card clicked' still logs: the event bubbles
});

link.addEventListener('click', (e) => {
  e.stopPropagation();  // card's listener doesn't run
  // the browser still navigates to /details
});
```

| | Default action | Other nodes' listeners | Other listeners on same node |
|---|---|---|---|
| `preventDefault()` | Cancelled | Run | Run |
| `stopPropagation()` | Happens | Skipped | Run |
| `stopImmediatePropagation()` | Happens | Skipped | Skipped (later-registered ones) |
| Both `preventDefault` + `stopPropagation` | Cancelled | Skipped | Run |

## `stopImmediatePropagation`

```js
button.addEventListener('click', (e) => {
  if (!isAllowed()) e.stopImmediatePropagation(); // guard runs first, blocks the rest
});
button.addEventListener('click', doTheThing); // skipped when blocked
```

Listeners on the same node run in registration order, so this only affects listeners added **after** the current one.

## When to use which

**`preventDefault`** when you replace native behaviour:
- Submitting a form via `fetch`.
- Client-side routing on links.
- Custom keyboard shortcuts, custom drag and drop (`dragover` must be prevented to allow a drop).

**`stopPropagation`** rarely, and deliberately:
- A button inside a clickable card that shouldn't also trigger the card's handler, though checking `event.target.closest('button')` in the card's handler is often cleaner.
- A nested menu where an inner `Escape` shouldn't also close the outer dialog.

## Why `stopPropagation` is risky

It's invisible to the code it affects. Stopping a click at a component boundary can silently break:

- **Outside-click detection** for dropdowns and popovers listening on `document`.
- **Analytics** and global shortcut handlers.
- **Event delegation** in parent components or frameworks.

Prefer letting events bubble and having handlers ignore events they don't own, or mark events (`e.defaultPrevented`, a `WeakSet` of handled events) instead of stopping them.

## Framework notes

- **React:** `e.stopPropagation()` on a synthetic event stops React propagation and calls the native method too. Because React 17+ listens on the root container, this now also stops native bubble listeners on `document` (in React 16, which listened on `document`, it couldn't). Native listeners attached directly to inner elements still run before React handlers.
- **Vue:** `@click.prevent` and `@click.stop` modifiers map to these methods.
- **jQuery:** `return false` in a handler did both, which caused many accidental propagation bugs in older code.

## Pitfalls

- Expecting `stopPropagation` to prevent navigation or form submission. It doesn't.
- Expecting `preventDefault` to keep parent handlers from running. It doesn't.
- Calling either after an `await`: dispatch is over by then.
- Stopping propagation in the capture phase on an ancestor prevents the target from ever receiving the event.

## In an interview, mention…

- Two orthogonal concerns: browser behaviour vs event travel.
- `stopImmediatePropagation` for same-element listeners.
- Why `stopPropagation` should be a last resort, and alternatives like target checks and `defaultPrevented`.
