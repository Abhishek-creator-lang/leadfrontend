## TL;DR

Passing a function to a state setter (`setCount(c => c + 1)`, or `this.setState(prev => …)` in classes) tells React: **"compute the next state from the latest pending state, not from the value this render captured."** React queues updater functions and applies them **in order** during the next render. Use it **whenever the next state depends on the previous state**, especially with several updates in one event, inside async callbacks, timers and effects, or to keep a callback's dependencies stable.

## The problem: state is a snapshot

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function addThree() {
    setCount(count + 1); // count is 0 in this render
    setCount(count + 1); // still 0
    setCount(count + 1); // still 0
  }
  // Result: 1, not 3
}
```

Every render has its own constant `count`. Setters don't mutate it. They **schedule** a re-render. With automatic batching (React 18+), all three calls are processed together, and each says "set to 1".

```jsx
function addThree() {
  setCount(c => c + 1); // queue: 0 → 1
  setCount(c => c + 1); // 1 → 2
  setCount(c => c + 1); // 2 → 3
}
```

During the next render React walks the queue: plain values replace the state, and functions receive the result of the previous step.

## Where it matters most

**1. Async callbacks and stale closures**

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setSeconds(s => s + 1); // always fresh, no dependency on `seconds`
  }, 1000);
  return () => clearInterval(id);
}, []); // safe with an empty dependency array
```

Writing `setSeconds(seconds + 1)` would freeze at 1, because the closure captured `seconds = 0`. Or you'd need `seconds` in the dependencies, which restarts the interval every second.

**2. Stable callbacks**

```jsx
const toggle = useCallback(() => setOpen(o => !o), []);
```

No dependency on `open`, so the function identity never changes, which helps memoized children.

**3. Reducer-like updates of objects and arrays**

```jsx
setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
```

This guarantees you transform the latest list even if another update was queued first.

## Rules for updater functions

- **Must be pure.** In Strict Mode (development), React calls updaters **twice** to surface side effects. Don't call APIs, mutate, or log inside them.
- **Return a new value.** Don't mutate `prev`.
- **No need for the callback when you're replacing state** with a value that doesn't depend on the old one (`setName(e.target.value)`).
- If you need many coordinated updates, `useReducer` is the next step up.

## Classes

`this.setState(updater, callback)`. The updater has the shape `(prevState, props) => partialState`. The optional second argument runs after the update is committed. The function-component equivalent is a `useEffect` reacting to the new state.

## In an interview, mention…

- State is a per-render snapshot, and setters enqueue updates.
- Updater functions are applied in order against the latest pending state, which makes repeated or async updates correct.
- They help avoid stale closures in intervals and effects and keep `useCallback` dependencies empty.
- They must be pure (Strict Mode double-invokes them).
