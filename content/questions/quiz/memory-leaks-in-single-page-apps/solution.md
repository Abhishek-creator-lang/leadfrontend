## TL;DR

JavaScript is garbage-collected, so a "leak" means **something reachable is still holding a reference** to memory you no longer need. In SPAs that never reload, small leaks per navigation add up to tabs using gigabytes, slowing GC pauses and eventually crashing on mobile. The usual causes are **listeners, subscriptions and timers that aren't cleaned up, detached DOM trees, unbounded caches and closures that capture large objects**. Find them by **repeating an action and comparing heap snapshots**.

## Common sources

| Leak | Example | Fix |
|---|---|---|
| Global or window listeners | `window.addEventListener('resize', onResize)` in a component, never removed | Remove on unmount, or use an `AbortController` `signal` for all listeners at once |
| Timers and intervals | `setInterval(poll, 5000)` keeps the closure (and its state) alive | `clearInterval` on unmount |
| Subscriptions | WebSocket, store, `EventEmitter` or observer callbacks | Unsubscribe and `disconnect()` observers |
| Detached DOM | A JS variable or cache still points to a removed node, keeping its whole subtree alive | Null out references; key caches with `WeakMap` |
| Unbounded caches | Memoisation maps or query caches keyed by ever-new IDs | LRU limits, TTLs, `WeakMap` when keyed by objects |
| Closures | A long-lived callback captures a large array it no longer needs | Narrow what's captured; copy just the needed fields |
| Third-party code | Analytics or chat widgets that re-initialise on each route | Initialise once; check their teardown APIs |
| Dev-only noise | React StrictMode double effects, devtools retaining objects, `console.log` of objects | Measure in production builds with the console closed |

```js
useEffect(() => {
  const ac = new AbortController();
  window.addEventListener('resize', onResize, { signal: ac.signal });
  document.addEventListener('keydown', onKey, { signal: ac.signal });
  const id = setInterval(poll, 5000);
  return () => { ac.abort(); clearInterval(id); };
}, []);
```

## Finding one: the three-snapshot technique

1. Load the page, do the action once to warm caches, force a GC (the trash-can icon in DevTools' Memory panel) and take **snapshot 1**.
2. Repeat the action N times (open and close the modal 10 times, navigate between routes), GC, take **snapshot 2**.
3. Repeat again, GC, take **snapshot 3**.
4. In snapshot 3, view **"Objects allocated between snapshots 1 and 2"** that still survive. Things that grow by N each round are your leak. Filter by "Detached" to find detached DOM trees.
5. Read the **retainers** panel bottom-up. It shows the chain (e.g. `Window → listeners → closure → context → HTMLDivElement`) that keeps the object alive. That chain points straight at the missing cleanup.

Other tools: the **Allocation instrumentation on timeline** recording, Performance-panel memory graphs (a sawtooth that trends upwards), the `performance.measureUserAgentSpecificMemory()` API for field monitoring (needs cross-origin isolation), and automated leak tests such as Meta's open-source **MemLab**, which runs scenarios in Puppeteer and diffs heaps.

## Weak references

- `WeakMap`/`WeakSet` keys don't keep their targets alive, which makes them good for per-object metadata.
- `WeakRef` and `FinalizationRegistry` exist, but GC timing is non-deterministic, so never rely on them for correctness. At most use them for caches or as a diagnostic.

## Pitfalls

- Reading the "JS heap size" in Task Manager without forcing GC. Garbage that hasn't been collected yet isn't a leak.
- Blaming the framework. Most leaks are in app code, in effects without cleanup.
- Testing in dev mode, where extra retention is normal.

## In an interview, mention…

- The definition: unintended reachability, not "memory not freed".
- A concrete story: a modal that left a `keydown` listener, found via retainers in heap snapshots.
- `AbortController` signals for listener cleanup, `WeakMap` for metadata, and bounded caches.
- Preventing regressions with an automated leak test in CI on key flows.
