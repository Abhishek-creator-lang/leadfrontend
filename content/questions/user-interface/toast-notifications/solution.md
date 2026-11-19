## Architecture

```
<ToastProvider>          state: toasts[] · api = { show, dismiss } (stable)
  {children}             call useToast().show(...)
  <section viewport>
    <div role="alert">   error toasts
    <div role="status">  everything else
      <Toast/>           owns its own timer and pause state
```

- **Provider** owns the list. **Each toast** owns its timer. The provider doesn't need to know about hovering or remaining time, and one toast pausing doesn't re-render the others.
- `show` and `dismiss` are wrapped in `useCallback` and exposed through a `useMemo`'d object. A component that only *triggers* toasts never re-renders when toasts appear or disappear. If the context value were a new object every render, every consumer would re-render on every toast. That's the most common performance mistake with context.
- `useToast` throws outside the provider, so you get a clear error instead of `cannot read 'show' of null`.

## State updates

```js
setToasts((prev) => [...prev, toast].slice(-max));
```

Updater functions everywhere: several toasts can be added in the same tick (a batch of failed requests), and each update must see the previous one. `slice(-max)` enforces the cap by dropping the oldest. An alternative is queueing the overflow and showing it when a slot frees up. That's better when every message matters.

## Timer with pause and resume

```js
useEffect(() => {
  if (paused) return;
  const startedAt = Date.now();
  const id = setTimeout(() => onDismissRef.current(toast.id), remaining.current);
  return () => { clearTimeout(id); remaining.current -= Date.now() - startedAt; };
}, [paused, toast.id]);
```

- Pausing re-runs the effect. The cleanup clears the timeout and subtracts the elapsed time, so resuming continues from what was left (tested).
- Pause on `mouseenter` **and** on `focus`. React's `onFocus`/`onBlur` bubble (they're `focusin`/`focusout`), so focusing the Dismiss button pauses the toast. The `relatedTarget` check avoids un-pausing while focus moves within the toast.
- The latest `onDismiss` is read through a ref, so a new callback identity doesn't restart the timer.

## Accessibility

- **Live regions must pre-exist.** Screen readers watch regions that are present in the DOM. A region mounted together with its content is often not announced, so both containers are always rendered, even when empty.
- **Politeness:** `role="status"` (polite) for success and info waits until the user is idle. `role="alert"` (assertive) for errors interrupts. Use assertive sparingly.
- **No focus stealing:** toasts are announced, not focused. Moving focus to a toast would yank keyboard users away from their task.
- **Timing (WCAG 2.2.1):** auto-dismissing content must be adjustable. Pausing on hover and focus helps. For **errors and anything actionable** (an "Undo" button), the safer pattern is *don't auto-dismiss*, or use a much longer duration, and make sure the information is also available elsewhere (an inline error, a notification centre). Mention this. It's the senior-level answer.
- The icons are decorative (`aria-hidden`), with colour plus icon plus text. The dismiss button has an explicit name.
- `prefers-reduced-motion` disables the slide-in. The viewport is a labelled `section` so users can find it. The container has `pointer-events: none` so empty space never blocks clicks, and the toasts re-enable them.

## Edge cases

- **Duplicates:** the same message fired 10 times. Dedupe by key (`show({ id: 'save' })` replaces the existing one) and reset its timer.
- **Unmount:** each toast's cleanup clears its timeout, and the provider unmounting clears everything.
- **Long messages** wrap, and the viewport width is clamped for small screens.

## Productionizing

- **Triggering outside React** (an HTTP interceptor): a tiny external store (`toastStore.show()`) that the provider subscribes to with `useSyncExternalStore`. React components and plain modules then share one API.
- **Actions:** `show({ message, action: { label: 'Undo', onClick } })`. Actionable toasts shouldn't auto-dismiss quickly. Consider a keyboard shortcut (<kbd>F8</kbd>, as Radix does) to jump to the viewport.
- **Promise helper:** `toast.promise(p, { loading, success, error })` updates one toast in place.
- **Server-rendered apps:** render the viewport only on the client, or it's empty on the server anyway.
- **Testing:** pass a short duration to the provider and use real waits. Assert on regions by role, not on class names.
