## TL;DR

`Map` and `Set` hold their keys/values **strongly**: as long as the collection is reachable, so are its entries. **`WeakMap`** and **`WeakSet`** hold their keys **weakly**: if nothing else references a key, the garbage collector may reclaim it and the entry silently disappears. In exchange, weak collections only accept **objects (or non-registered symbols) as keys** and are **not iterable** and have **no `size`**. Use them to **attach metadata to objects you don't own** without causing memory leaks.

## The difference in practice

```js
let node = document.createElement('div');

const strong = new Map([[node, { clicks: 0 }]]);
const weak = new WeakMap([[node, { clicks: 0 }]]);

node.remove();
node = null;
// strong still keeps the element (and its metadata) alive: a leak.
// weak lets both be collected once no other reference exists.
```

| | `Map` / `Set` | `WeakMap` / `WeakSet` |
|---|---|---|
| Key types | Any value | Objects and non-registered symbols only |
| Keeps key alive | Yes | No |
| Iterable / `size` / `clear()` | Yes | No (contents depend on GC timing) |
| API | `get/set/has/delete`, iteration | `get/set/has/delete` (WeakMap), `add/has/delete` (WeakSet) |

They're not iterable *because* their contents are nondeterministic: exposing them would leak garbage collector timing.

## Real use cases

**Per-object caches (memoisation):**

```js
const cache = new WeakMap();
function layoutOf(el) {
  if (!cache.has(el)) cache.set(el, el.getBoundingClientRect());
  return cache.get(el);
}
```

When the element is gone, the cache entry goes with it. No eviction code needed.

**Private data for objects (pre-`#private` pattern, still used by libraries):**

```js
const secrets = new WeakMap();
class Account {
  constructor(pin) { secrets.set(this, { pin }); }
  check(pin) { return secrets.get(this).pin === pin; }
}
```

**Tagging objects without mutating them (WeakSet):**

```js
const seen = new WeakSet();
function deepClone(obj) {
  if (seen.has(obj)) throw new Error('cycle');
  seen.add(obj);
  // ...
}
```

Frameworks use this pattern: Vue 3's reactivity keeps a `WeakMap` from raw objects to their proxies and dependency maps.

## Related tools

- **`WeakRef`** holds a weak reference to a single object (`ref.deref()` returns it or `undefined`).
- **`FinalizationRegistry`** runs a callback some time after an object is collected.

Both are low-level. GC timing is unspecified, so code must never depend on *when* (or whether) cleanup happens.

## Pitfalls

- A **weak key with a value that references the key** is fine. `WeakMap` is an *ephemeron* table, so the value doesn't keep the key alive.
- Primitives can't be keys: `weak.set('id', x)` throws a `TypeError`. Registered symbols (`Symbol.for`) are rejected too because they live forever.
- You can't debug a weak collection by listing it. Keep a dev-only strong `Map` if you need visibility.
- Weak collections don't free memory *immediately*; collection happens on the engine's schedule.

## In an interview, mention…

- Strong vs weak references and why weak collections can't be iterated.
- Concrete leak scenarios: caches keyed by DOM nodes, component instances or request objects.
- `WeakRef`/`FinalizationRegistry` exist, but are a last resort, and GC timing must never drive program logic.
