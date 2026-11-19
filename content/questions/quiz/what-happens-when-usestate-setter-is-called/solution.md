## TL;DR

Calling `setX(next)` **doesn't change `x` immediately**. It **enqueues an update** on the component's fiber (a value or an updater function), marks that fiber and its ancestors as needing work at a **priority lane** (urgent for a click, lower inside `startTransition`), and asks React to **schedule a render**. Updates from the same tick are **batched** (automatically everywhere since React 18). During the next render React **processes the queue in order** to compute the new state, re-renders the component and its children, reconciles, and **commits** the DOM changes. Then effects run. If the new state is `Object.is`-equal to the current one, React may **bail out** and skip re-rendering.

## Step by step

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(c => c + 1);
    console.log(count); // 0: this render's snapshot
  }
  return <button onClick={handleClick}>{count}</button>;
}
```

1. **Enqueue.** Each call appends an update object to the hook's queue: first "replace with 1", then "c => c + 1".
2. **Schedule.** React marks the fiber with the update's lane and schedules work on the root. Inside a React event handler nothing renders yet. The handler finishes first.
3. **Batch.** Both updates (and any others in this event, even in other components) are processed in **one render**. React 18's `createRoot` extends batching to promises, `setTimeout` and native event handlers. Before React 18, only React event handlers batched.
4. **Render.** React calls `Counter` again. `useState` walks the queue: 0 → 1 (replace) → 2 (updater). The new `count` is 2.
5. **Reconcile.** It compares the new output with the previous one, which yields a text change.
6. **Commit.** It updates the DOM text node, runs layout effects, the browser paints, then passive effects run (with cleanups first for changed dependencies).

The `console.log` printed `0`, because state is a **snapshot per render**. The handler closed over the render where `count` was 0.

## Bail-outs

```jsx
setCount(0); // when count is already 0
```

If the queue was empty, React can compare eagerly and skip scheduling a render entirely. Otherwise it may still render the component once to confirm, but if the result is equal it **won't re-render the children or commit**. Objects are compared by reference, so `setUser(user)` after mutating it is a no-op. That's why mutation breaks updates.

## Priority and concurrency

- Clicks and key presses get a **synchronous/discrete lane**, flushed quickly (a microtask at the end of the event).
- Updates inside `startTransition` get a **transition lane**. React renders them in the background, can interrupt them for urgent updates, and keeps the old UI on screen meanwhile.
- `flushSync(() => setX(…))` forces a synchronous render and commit, which you need in rare cases like measuring the DOM right after an update. Use it sparingly.

## Rules that follow

- **Don't read state right after setting it** and expect the new value. Compute the next value in a variable, or use the updater form.
- **Use updater functions** when the new value depends on the old one, especially across multiple calls or in async code.
- **Setting state during render** is allowed only for the "adjust state when a prop changes" pattern, with a guard. Otherwise it loops.
- **Setting state on an unmounted component** does nothing. React 18 removed the old warning about it.
- **Setters are stable.** You don't need them in dependency arrays.

## In an interview, mention…

- Enqueue, schedule (with a lane), batch, render (process the queue), reconcile, commit, effects.
- The state snapshot explains why `console.log` shows the old value.
- Automatic batching in React 18, and transitions and `flushSync` as priority controls.
- `Object.is` bail-out, and why mutation defeats it.
