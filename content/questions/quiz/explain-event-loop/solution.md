## TL;DR

JavaScript runs your code on **one thread with one call stack**. The **event loop** decides what runs next once the stack is empty. Each turn of the loop it takes **one task** (a macrotask such as a timer callback or an event handler), runs it to completion, then **drains the entire microtask queue** (promise reactions, `queueMicrotask`, `MutationObserver`). After that the browser may **render** (style, layout, paint, with `requestAnimationFrame` callbacks just before) before the next task.

## The loop, step by step (browser)

1. Pick the oldest runnable **task** from a task queue and run it until the call stack is empty.
2. Run **all microtasks**, including any microtasks queued *by* microtasks, until the microtask queue is empty.
3. If it's time to update the rendering (roughly once per display frame), run `requestAnimationFrame` callbacks, then style, layout and paint.
4. Repeat.

| Queue | Examples | When it runs |
|---|---|---|
| Task (macrotask) | `setTimeout`, `setInterval`, I/O, UI events, `MessageChannel`, `postMessage` | One per loop iteration |
| Microtask | `Promise.then/catch/finally`, `await` continuations, `queueMicrotask`, `MutationObserver` | All of them, after each task, before rendering |
| Animation frame | `requestAnimationFrame` | Before the next paint |

## Classic example

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');
// 1, 5, 3, 4, 2
```

`1` and `5` are synchronous. Once the script (itself a task) finishes, the microtask queue drains in order (`3`, `4`). The timer callback is a separate task, so it runs last, even with a 0 ms delay.

`await` splits a function. Everything after `await x` is scheduled as a microtask once `x` settles:

```js
async function f() {
  console.log('a');
  await null;
  console.log('b'); // microtask
}
f();
console.log('c');
// a, c, b
```

## Why it matters in practice

- **Microtask starvation.** A microtask that keeps queueing more microtasks blocks rendering and input forever, because the queue must be empty before the browser can paint. A recursive `setTimeout` doesn't have this problem.
- **Long tasks hurt INP.** Any task over 50 ms delays input handling. Break work up with `scheduler.yield()` where it's available, or a `setTimeout`/`MessageChannel` yield, or move it to a Web Worker.
- **`setTimeout(fn, 0)` is not 0 ms.** It is at least the next task. Nested timers are clamped to ≥ 4 ms after 5 levels, and background tabs throttle them much more.
- **React batching.** React 18 batches state updates inside promises and timeouts as well, flushing them in a microtask or later. That's why `setState` followed by reading the DOM doesn't show the new value yet.

## Node.js differences (good to mention)

Node's loop has phases: timers, pending callbacks, poll, check (`setImmediate`), and close. `process.nextTick` callbacks run **before** promise microtasks. Since Node 11, microtasks are drained after **each** timer or immediate callback, which matches browser semantics.

## In an interview, mention…

- One thread, run-to-completion semantics, so there are no data races within the main thread.
- Microtasks run before the next task and before rendering.
- How this affects UI responsiveness (INP) and how you'd yield to the browser.
