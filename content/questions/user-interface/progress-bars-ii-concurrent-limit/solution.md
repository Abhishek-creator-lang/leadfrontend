## Where the limit lives

A bar can't decide whether it's allowed to run, because that depends on every other bar. So the **parent owns scheduling** and each bar owns only its own timeline:

- `App` state: `bars: { id, label, done }[]`, in insertion order.
- Derived in render: `running = first MAX_CONCURRENT bars where !done`.
- Each `ProgressBar` gets `active` and `onComplete`. It animates only while `active`, and reports when it hits 100%.

The running set is **derived, not stored**. Storing `running` and `queued` arrays as well as `done` means three lists that must be updated together, and a missed update leaves a slot leaking or two bars fighting over it. With derivation, the queue advances automatically: when bar 2 calls `onComplete`, it's marked `done`, the next render computes a new running set, and bar 4's `active` flips to `true`, which starts its effect.

## Effect details

```js
useEffect(() => {
  if (!active) return;
  // rAF loop ...
  return () => cancelAnimationFrame(frame);
}, [active, duration]);
```

- **Latest-callback ref.** `onComplete` is a new arrow function on every parent render. Putting it in the dependency array would cancel and restart the animation every time *any* bar updates. Storing it in a ref (updated in an effect) keeps the loop stable while still calling the latest callback. React's experimental `useEffectEvent` formalises this pattern.
- `complete` uses a functional `setBars` update, because several bars can finish in the same frame and each update must see the others.
- Clear unmounts all bars, and their cleanups cancel the frames. No orphaned loops.

## Accessibility

- Queued bars are real progress bars at 0 with `aria-valuetext="Queued"`. Screen readers say "Download 4, progress bar, Queued" rather than a misleading "0%".
- The summary line gives the overall picture. In production, make it a polite live region but throttle announcements (for example, only on completion), or it becomes noise.
- Queued bars get a muted style (`.bar--queued`) and the visible "Queued" text, so the state isn't conveyed by colour alone.

## Edge cases

- **Changing the limit at runtime:** because `running` is derived, lowering it from 3 to 1 just flips `active` to `false` on two bars, and their cleanup stops them. Their progress is kept in state, *but* restarting resets `start`. To resume rather than restart, the bar needs to remember elapsed time. That's the jump to *Progress Bars III*.
- **Strict Mode:** the double-invoked effect cancels and restarts while still at 0, so it's harmless.
- **Ordering:** FIFO by insertion. A priority queue would sort the unfinished list by priority before slicing.

## Mapping to real uploads

Replace the rAF timeline with a real task:

```js
async function runQueue(tasks, limit) {
  const results = [];
  let i = 0;
  const worker = async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

In React, keep the queue outside render (a store or a `useRef`-held scheduler), feed progress into state, and let an `AbortController` per task make Clear actually cancel the network requests.

## Follow-ups

- **Retry a failed bar:** add `status: 'queued' | 'running' | 'done' | 'error'`, and derive running from status instead of a boolean.
- **Perf with many bars:** one shared rAF ticker instead of one per bar (see Progress Bars III).
