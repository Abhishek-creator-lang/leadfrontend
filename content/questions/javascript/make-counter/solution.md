## Approach

Store the next value in a local variable of `makeCounter`. The returned function closes over it, so the variable outlives the call to `makeCounter` and is reachable *only* through that function.

```js
let next = initial;
function counter() {
  const current = next;
  next += step;
  return current;
}
counter.reset = () => { next = initial; };
```

The "return then advance" order is the subtle bit. `return next++` works when `step` is 1, but the explicit `current` variable reads well and generalises to any step.

## Why each counter is independent

Each call to `makeCounter` creates a new execution context with a fresh `next` binding. Two counters therefore close over two different variables. This is the classic demonstration that closures capture **bindings**, not values.

## Complexity

O(1) time and space per call.

## Edge cases

- **Default parameters:** `makeCounter()` starts at 0 and counts up by 1.
- **Negative or fractional steps:** they work. Fractional steps accumulate floating-point error (`0.1 + 0.2`), which is worth mentioning.
- **`reset`:** restores `initial`, not the current value, and does not affect other counters.

## Common mistakes

| Mistake | Consequence |
|---|---|
| A module-level `count` | All counters share state |
| Incrementing before returning | The first call returns `initial + step` |
| Exposing `counter.count = …` | State is no longer private and can be corrupted |
| `reset` setting `next = 0` | Wrong when `initial` is not 0 |

## Follow-ups

- **Class with `#count`:** private fields give the same encapsulation with a method-based API (`counter.next()`), and instances share methods via the prototype, which saves memory when you create many of them.
- **Lifetime:** the closure keeps `next` reachable. It is collected when nothing references the counter function any more.
- **React:** `useState` is a closure-based store keyed by hook call order. Stale closures in effects are the same mechanism seen from the other side: a callback that captured an old binding keeps seeing old state.
