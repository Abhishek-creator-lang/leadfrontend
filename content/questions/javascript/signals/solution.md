## Core idea: automatic dependency tracking

A global variable `currentObserver` holds the memo or effect that is currently running. Every signal read calls `track(source)`, which links the source and the current observer in both directions:

```js
function track(source) {
  if (currentObserver) {
    currentObserver.sources.add(source);
    source.observers.add(currentObserver);
  }
}
```

That's the whole trick behind "no dependency arrays": because JavaScript is single-threaded, whichever computation is running when `count()` is called is the one that depends on it. `untrack` just sets `currentObserver = null` temporarily.

**Dynamic dependencies:** before each re-run, a node unsubscribes from all its old sources and clears its `sources` set; running `fn` again re-collects exactly what it reads this time. That's why the `cond() ? a() : b()` effect stops listening to `a`.

## Why pure "push" is glitchy

The naive implementation re-runs observers as soon as a signal changes. In a diamond:

```text
      a
    /   \
 double  plusOne     (memos)
    \   /
    effect
```

`setA(5)` pushes to `double`, which recomputes and immediately re-runs the effect. The effect reads the **new** `double` (10) but the **old** `plusOne` (2): a glitch, an inconsistent state visible to user code. Then `plusOne` updates and the effect runs a second time.

## Push-pull with three colours

The solution splits propagation into two phases.

**Push (mark):** when a signal changes, mark its direct observers `DIRTY`. Memos propagate `CHECK` ("maybe stale") to their observers, recursively. Effects that leave the `CLEAN` state are queued. No user code runs during marking.

**Pull (validate):** effects in the queue run `updateIfNecessary`:

```js
function updateIfNecessary(node) {
  if (node.state === CHECK) {
    for (const source of node.sources) {
      if (source.kind === 'memo') {
        updateIfNecessary(source);          // bring the upstream memo up to date first
        if (node.state === DIRTY) break;    // it changed and marked us dirty
      }
    }
  }
  if (node.state === DIRTY) run(node);
  node.state = CLEAN;
}
```

A memo that recomputes compares old and new values. Only if they differ does it mark its observers `DIRTY`. If no upstream memo actually changed, the `CHECK` node becomes `CLEAN` without running: that's the **equality cut-off** (`isEven` staying `true` when `count` goes from 2 to 4).

In the diamond, the effect is marked `CHECK` once, queued once, and when it finally runs, every memo it reads is pulled up to date on demand. One run, consistent values. Memos are lazy for free: nothing recomputes them until somebody reads them.

This three-state algorithm is the one popularised by the "Reactively" library and used in some form by Solid 2, Preact Signals, Angular and the TC39 proposal's reference polyfill.

## Effects, cleanup and batching

- Running an effect first calls the previous cleanup, then `fn`, storing any returned function as the new cleanup, the same contract as React's `useEffect`.
- `write` calls `flush()` after marking, which drains the queue. A `flushing` flag makes nested writes (an effect setting another signal) append to the queue instead of re-entering, so updates propagate in order.
- `batch` increments a depth counter; `flush` does nothing while the depth is non-zero, and the outermost `batch` flushes in `finally`. Writes inside the batch update values immediately (reads see them); only effects are deferred.

## Complexity

Marking is O(affected nodes). Validation visits each affected node once per flush. Memory is O(edges) for the bidirectional source/observer sets. Compare with React, where an update re-renders the component subtree and diffs it: signals update **exactly** the computations that read the changed value.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Not clearing old sources before re-running | Effects keep firing for signals they no longer read; leaks |
| Running effects during marking (pure push) | Glitches and duplicate effect runs in diamonds |
| Eager memos implemented as "signal + effect" | Wasted work for unread memos, and glitches |
| No `Object.is` check on write | Effects re-run on no-op updates |
| Forgetting to restore `currentObserver` (use `try/finally`) | A thrown error leaves tracking pointing at the wrong node |
| Iterating `observers` while marking/running mutates it | Skipped or repeated notifications; copy first |

## Signals vs React

- **React:** state changes schedule a re-render of the component; the new virtual tree is diffed against the old. Simple mental model ("UI is a function of state"), but work is proportional to the subtree, which is why `memo`, `useMemo` and the React Compiler exist.
- **Signals:** components run once; the dependency graph connects each signal directly to the DOM bindings that read it. Updates are surgical, but you must keep reads inside tracked scopes (destructuring props in Solid breaks reactivity).

To use a signal in React, wrap it with `useSyncExternalStore`: `subscribe` creates an effect that reads the signal and calls the React callback; `getSnapshot` returns `untrack(read)`. Preact Signals ships an integration along these lines.

## Follow-ups

- **Ownership:** effects created inside other effects should be disposed when the parent re-runs (Solid's `createRoot` / owner tree).
- **Error handling:** catch errors per effect so one failing effect doesn't stop the flush, and surface them to an error boundary.
- **Async:** a `createResource` that tracks a source signal and exposes loading/error/data signals.
- **Scheduling:** run effects in a microtask instead of synchronously, which batches automatically at the cost of reads seeing values before effects have run.
