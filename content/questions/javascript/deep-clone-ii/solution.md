## Approach

Start from the basic recursive clone and add two things:

1. **A memo of already-cloned objects** (`WeakMap<source, clone>`). It solves cycles *and* shared references with one mechanism.
2. **Type-specific branches** for built-ins whose state lives in internal slots rather than in properties.

### The memo, and why ordering matters

```js
const copy = Object.create(Object.getPrototypeOf(input));
seen.set(input, copy);           // 1. register the (still empty) clone
for (const key of keys) {        // 2. then recurse into children
  copy[key] = clone(input[key]);
}
```

If you register *after* filling the children, a child that points back to `input` won't find it in the memo and will recurse forever. Registering the empty shell first means a back-reference gets the shell, which is filled in by the time the top-level call returns.

The same memo gives shared-reference preservation for free: the second time a source object appears, the lookup returns the existing clone.

### Why a `WeakMap`?

Keys are objects, lookups are O(1), and the map holds its keys **weakly**. The memo only lives for one call here, so a `Map` would also work, but `WeakMap` is the right default whenever objects are cache keys: it can never cause a leak if the cache outlives the call (e.g. if you hoisted it for performance).

### Built-ins

- **`Date`** stores its time in an internal slot. `Object.keys(new Date())` is `[]`, so a generic clone would produce an empty object with `Date.prototype`, and calling `getTime()` on it throws. Copy via `new Date(d.getTime())`.
- **`RegExp`:** `new RegExp(source, flags)` plus `lastIndex`, which is a normal writable property that matters for `g`/`y` regexes.
- **`Map`/`Set`:** entries are internal, not properties. Iterate and clone both keys and values. Register the empty collection *before* iterating, for the same cycle reason.
- **Arrays:** `new Array(length)` then copy keys, so holes stay holes.
- **Everything else:** `Object.create(proto)` keeps methods working (`copy.sum()`), and `Object.keys` + enumerable symbols copies the data.

## Complexity

O(n) time and space for n reachable objects and values; each object is cloned once thanks to the memo. Recursion depth is the longest acyclic path.

## Edge cases and limits

- **Private fields (`#x`) and closures** can't be copied: a cloned class instance that relies on `#x` will throw "Cannot read private member" when its methods run.
- **Other internal-slot types** (`ArrayBuffer`, typed arrays, `Error`, `Blob`, `WeakMap`, DOM nodes) would come out as empty shells. `structuredClone` handles many of these, but throws for functions/DOM nodes and drops prototypes.
- **Getters** are invoked and their *values* copied; the clone has data properties, not accessors. Use `Object.getOwnPropertyDescriptors` if accessors must survive.
- **Frozen objects:** the clone is not frozen.
- **`instanceof` across realms** (iframes) fails; `Object.prototype.toString.call(x) === '[object Date]'` is more robust.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Registering in the memo after recursing | Stack overflow on cycles |
| Using an array + `indexOf` as the memo | O(n²) |
| Forgetting `Map` keys can be objects | Keys stay shared with the original |
| Generic object path for `Date` | Produces an unusable "Date" with no time value |
| `{}` instead of `Object.create(proto)` | Class instances lose their methods |
| `Object.keys` only | Symbol-keyed data is silently dropped |

## Follow-ups interviewers ask

- **Iterative version:** a stack of `[source, target, key]` work items avoids call-stack limits on very deep graphs (e.g. a 100k-node linked list).
- **Customiser hook** (like lodash's `cloneDeepWith`): `clone(value, customizer)` lets callers handle domain types.
- **When should you deep clone at all?** In React/Redux, prefer structural sharing (copy only the changed path). Deep cloning everything breaks memoisation because every reference changes.
