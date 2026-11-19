Signals are the reactivity model behind SolidJS, Preact Signals, Angular's `signal()`, Vue's `ref` and the TC39 Signals proposal. Implement a small version.

```js
import createSignal, { createEffect, createMemo, batch, untrack } from './index';

const [count, setCount] = createSignal(1);
const double = createMemo(() => count() * 2);

createEffect(() => {
  console.log(`count=${count()} double=${double()}`);
});
// logs "count=1 double=2" immediately

setCount(5);                 // logs "count=5 double=10"
setCount((c) => c + 1);      // logs "count=6 double=12"
```

No dependency arrays: an effect re-runs because it **read** `count()` during its last run.

## API

| Function | Behaviour |
|---|---|
| `createSignal(initial)` (default export) | Returns `[read, write]`. `write(value)` or `write(prev => next)`. Writing a value that is `Object.is`-equal to the current one does nothing. |
| `createEffect(fn)` | Runs `fn` immediately, then again **synchronously** whenever a signal or memo it read during its last run changes. If `fn` returns a function, that cleanup runs before the next run and on dispose. Returns a `dispose()` function that stops the effect. |
| `createMemo(fn)` | Returns a read function for a cached derived value. It's **lazy**: `fn` runs on the first read, and afterwards only when a dependency has changed and the memo is read again. |
| `batch(fn)` | Runs `fn`; effects triggered by writes inside it run **once**, after the outermost batch ends. Returns `fn`'s result. Reads inside the batch see the new values. |
| `untrack(fn)` | Runs `fn` and returns its result, without subscribing the current effect or memo to anything `fn` reads. |

## Requirements

- **Dynamic dependencies:** each run re-collects dependencies. After `cond() ? a() : b()` switches to `b`, changes to `a` must no longer trigger the effect.
- **Glitch-free:** in a diamond (`a` feeds memos `x` and `y`, an effect reads both), one write to `a` runs the effect **once**, and it sees the new values of both memos.
- **Equality cut-off:** if a memo recomputes to the same value (`Object.is`), the effects that depend only on it don't re-run.
- Effects may write to other signals; those updates propagate too.
- You don't need to handle effects that write to signals they themselves read.

## Follow-up

- How do signals differ from React's re-render-and-diff model? What does each optimise for?
- What does "push-pull" mean, and why is pure push glitchy?
- How would you integrate a signal into a React component?
