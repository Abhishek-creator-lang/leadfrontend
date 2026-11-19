## TL;DR

All three defer a callback, but to **different points of the Node.js event loop**. **`process.nextTick`** runs **right after the current operation, before promise microtasks** and before the loop continues. **`setImmediate`** runs in the **check phase**, right after I/O polling in the current loop iteration. **`setTimeout(fn, 0)`** runs in the **timers phase** once at least ~1 ms has elapsed. Only `setTimeout` exists in browsers; `setImmediate` and `process.nextTick` are Node APIs (also in Bun and Deno's Node compatibility).

## Where each runs

Each Node loop iteration goes through phases: **timers → pending callbacks → poll (I/O) → check (`setImmediate`) → close callbacks**. Between every callback, Node drains:

1. the **`process.nextTick` queue**, then
2. the **promise microtask queue**.

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');

// sync
// nextTick
// promise
// timeout / immediate  ← order of these two is NOT guaranteed in the main module
```

`setTimeout(fn, 0)` is coerced to 1 ms. Whether the timer is due by the time the loop starts depends on process timing, so `timeout` and `immediate` can swap.

Inside an I/O callback the order *is* deterministic, because after the poll phase comes the check phase:

```js
import { readFile } from 'node:fs';
readFile(import.meta.filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// always: immediate, timeout
```

## Comparison

| | `process.nextTick` | Promise microtask | `setImmediate` | `setTimeout(fn, 0)` |
|---|---|---|---|---|
| Queue | nextTick queue | Microtask queue | Check phase | Timers phase |
| Runs | Before anything else continues | After nextTick queue | After I/O poll, same iteration | Next timers phase with ≥ 1 ms elapsed |
| Can starve I/O | Yes | Yes | No | No |
| Browser | No | Yes (`queueMicrotask`) | No (non-standard, only old IE/Edge) | Yes |

## When to use which

- **`process.nextTick`:** rarely in application code. Library authors use it to make an API **consistently asynchronous**, e.g. emitting an error event after the caller has had a chance to attach listeners. `queueMicrotask` is the standard alternative and usually preferable.
- **`setImmediate`:** to **yield to I/O** while splitting a long CPU job into chunks, so the server keeps handling requests.
- **`setTimeout`:** when you actually want a delay, or in cross-platform code.

```js
function processInChunks(items, fn) {
  let i = 0;
  (function chunk() {
    const end = Math.min(i + 1000, items.length);
    for (; i < end; i++) fn(items[i]);
    if (i < items.length) setImmediate(chunk); // lets pending I/O run between chunks
  })();
}
```

## Browser equivalents

- Microtask: `queueMicrotask(fn)` or `Promise.resolve().then(fn)`.
- Yield to the next task: `setTimeout(fn, 0)` (clamped to ≥ 4 ms after 5 nested levels), `MessageChannel` tricks, or **`scheduler.postTask`/`scheduler.yield()`** in Chromium and Firefox.

## Pitfalls

- **Recursive `nextTick` or microtasks starve the loop**: I/O, timers and even `setImmediate` never get a turn.
- The names are confusing: `setImmediate` is *less* immediate than `nextTick`. Node's own docs acknowledge this.
- Since Node 11, nextTick and microtasks drain after **each** timer/immediate callback (matching browsers), not after the whole phase. Old blog posts show different output.

## In an interview, mention…

- Node's loop phases and the two "between every callback" queues (nextTick first, then promises).
- Why `timeout` vs `immediate` order is nondeterministic at top level but fixed inside I/O callbacks.
- Starvation risk, and the browser counterparts (`queueMicrotask`, `scheduler.yield`).
