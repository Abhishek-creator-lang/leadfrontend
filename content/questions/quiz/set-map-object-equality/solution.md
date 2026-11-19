## TL;DR

`Set` and `Map` compare values with **SameValueZero**: like `===`, except **`NaN` equals `NaN`** (and `+0` equals `-0`). For objects, arrays and functions, that means **reference identity**: two different objects with identical contents are **different keys**. To treat objects as equal by content, **derive a primitive key** (an ID or a canonical string) or keep a Map from that key to the object.

## Demonstration

```js
const set = new Set();
set.add({ id: 1 });
set.add({ id: 1 });
set.size;              // 2: two distinct objects

const a = { id: 1 };
set.add(a);
set.add(a);
set.size;              // 3: same reference added twice counts once
set.has({ id: 1 });    // false
set.has(a);            // true

const map = new Map([[['x', 'y'], 'value']]);
map.get(['x', 'y']);   // undefined: a new array is a new key
```

Primitives behave as you'd expect, plus the `NaN` special case:

```js
new Set([1, '1', 1]).size; // 2: no type coercion
new Set([NaN, NaN]).size;  // 1, even though NaN !== NaN
new Set([0, -0]).size;     // 1
```

## Comparison with other equality algorithms

| Algorithm | `NaN` vs `NaN` | `+0` vs `-0` | Used by |
|---|---|---|---|
| `===` (Strict) | false | true | `indexOf` |
| `Object.is` (SameValue) | true | false | React state comparison |
| SameValueZero | true | true | `Set`, `Map`, `includes` |

## Strategies for content-based equality

**1. Use a natural primitive key**

```js
const usersById = new Map(users.map((u) => [u.id, u]));
usersById.get(42);
```

This is the most common and robust approach.

**2. Serialize to a canonical string**

```js
const key = (p) => `${p.x},${p.y}`;
const visited = new Set();
visited.add(key({ x: 1, y: 2 }));
visited.has(key({ x: 1, y: 2 })); // true
```

Fine for small, flat, known shapes. `JSON.stringify` as a key is fragile: property order changes the string, and `undefined`/functions/`Date` serialize lossily.

**3. Intern objects**

Keep one canonical instance per logical value, so reference equality becomes value equality:

```js
const pool = new Map();
function point(x, y) {
  const k = `${x},${y}`;
  if (!pool.has(k)) pool.set(k, Object.freeze({ x, y }));
  return pool.get(k);
}
new Set([point(1, 2), point(1, 2)]).size; // 1
```

**4. Wrap with a custom collection** that maps through a key function (`new KeyedSet((u) => u.id)`). There's no built-in hook for custom equality; the TC39 Records & Tuples proposal (which would have given deep primitive equality) was withdrawn, and a "composite keys" follow-up is still under discussion.

## Why reference keys are useful

Identity semantics is often exactly what you want:

```js
const meta = new WeakMap();
meta.set(domNode, { measuredAt: performance.now() });
```

Attaching data to a specific object instance (DOM nodes, component instances, request objects) without mutating it relies on identity, and `WeakMap` lets the entry be garbage-collected with the object.

## Pitfalls

- **Mutating an object key is harmless** for identity-keyed entries (the reference is unchanged), but a string key you derived from its contents earlier is now stale.
- **Deduplicating API results**: `[...new Set(items)]` won't remove content duplicates, so dedupe via `Map` keyed by ID.
- **React state**: putting objects into a Set in state and then creating "equal" new objects on each render makes `has` fail.

## In an interview, mention…

- SameValueZero, the `NaN` special case, and reference identity for objects.
- Deriving primitive keys as the standard solution, with the `JSON.stringify` caveats.
- Identity keys as a feature, especially with `WeakMap`.
