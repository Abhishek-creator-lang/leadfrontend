## TL;DR

Call **`event.preventDefault()`** inside a listener to cancel the browser's **built-in action** for that event: following a link, submitting a form, toggling a checkbox, scrolling on wheel/touch, opening the context menu, and so on. It only works if the event is **`cancelable`** and the listener is **not `passive`**. It does **not** stop the event from propagating to other listeners. Check `event.defaultPrevented` to see whether someone already cancelled it.

## Examples

```js
// Handle a form with fetch instead of a full page navigation
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  await fetch(form.action, { method: 'POST', body: data });
});

// Client-side routing for internal links
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="/"]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  router.navigate(link.getAttribute('href'));
});

// Custom keyboard shortcut
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault(); // stop the browser's "Save page" dialog
    saveDocument();
  }
});
```

Note the modifier-key check in the router example: blocking Ctrl/Cmd-click breaks "open in new tab", a common accessibility and UX regression.

## Cancelable vs not

```js
element.addEventListener('scroll', (e) => console.log(e.cancelable)); // false
```

- Cancelable: `click`, `submit`, `keydown`, `wheel`, `touchmove`, `contextmenu`, `dragover`, `beforeinput` (mostly), `invalid`, `beforeunload`.
- Not cancelable: `scroll`, `load`, `focus`/`blur`, `input` (use `beforeinput` to block edits), `change`.

Calling `preventDefault()` on a non-cancelable event is a no-op.

## Passive listeners

```js
window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false }); // must opt out
```

`touchstart`, `touchmove` and `wheel` listeners on `window`, `document` and `body` are **passive by default**, so the browser can scroll without waiting for JS. To block scrolling there, pass `{ passive: false }`, but prefer CSS (`touch-action`, `overscroll-behavior`, `overflow: hidden`) for performance.

## `return false` and other legacy forms

- In `addEventListener` listeners, `return false` does **nothing**.
- In `on*` properties/attributes (`onclick="return false"`), returning `false` cancels the default.
- In jQuery, `return false` meant `preventDefault()` + `stopPropagation()`.
- React: you must call `e.preventDefault()` explicitly; returning `false` doesn't work.

## Coordinating with other code

```js
form.addEventListener('submit', (e) => {
  if (e.defaultPrevented) return; // another handler already took over
  // …
});
```

Custom events can be cancelable too: `dispatchEvent` returns `false` if a listener called `preventDefault()`. That's a simple way to let consumers veto an action:

```js
const proceed = el.dispatchEvent(new CustomEvent('tab:change', { cancelable: true, detail: { to: 2 } }));
if (proceed) activateTab(2);
```

## Pitfalls

- **Calling it after an `await`**: dispatch has already finished, so it's too late. Call it synchronously at the top of the handler.
- **Breaking native behaviour without replacing it:** prevented links/buttons must still work with keyboard, middle-click and assistive tech. Use real `<a>` and `<button>` elements.
- Preventing `submit` is better than preventing the button's `click`, because it also covers pressing Enter in a field.
- Confusing it with `stopPropagation()`, which doesn't cancel the default action.

## In an interview, mention…

- What counts as a default action, `cancelable`, and `defaultPrevented`.
- Passive listeners and CSS alternatives for scroll/touch.
- Synchronous timing (not after `await`), modifier keys and accessibility when overriding native behaviour.
