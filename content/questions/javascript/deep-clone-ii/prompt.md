Implement `deepClone(value)` for **real-world** object graphs, not just JSON-shaped trees. The clone must be fully independent of the original, and it must preserve the graph's **shape**, including cycles and objects that are referenced from more than one place.

```js
const shared = { tag: 'x' };
const original = {
  created: new Date('2024-01-01'),
  pattern: /ab+c/gi,
  lookup: new Map([[shared, new Set([1, 2])]]),
  a: shared,
  b: shared,
};
original.self = original;

const copy = deepClone(original);
copy.self === copy;           // true (cycle preserved)
copy.a === copy.b;            // true (sharing preserved)
copy.a === original.a;        // false
copy.created instanceof Date; // true, same time, different object
```

## Signature

```js
deepClone(value)
```

## Requirements

| Input | Clone |
|---|---|
| Primitives (incl. `symbol`, `bigint`) | returned as is |
| Functions | returned **by reference** (functions are not cloned) |
| `Date` | new `Date` with the same time value |
| `RegExp` | new `RegExp` with the same `source` and `flags`, and the same `lastIndex` |
| `Map` | new `Map`; every key **and** value is deep-cloned, insertion order kept |
| `Set` | new `Set`; every value deep-cloned, insertion order kept |
| Array | new array of the same length, elements deep-cloned |
| Any other object | new object with the **same prototype** (`Object.getPrototypeOf`), copying own enumerable **string and symbol** keys, values deep-cloned |

- **Cycles:** an object that (directly or indirectly) contains itself must not cause infinite recursion. The clone contains the same cycle, pointing to clone objects.
- **Shared references:** if the same source object appears multiple times, the clone uses **one** cloned object in all those places.
- Never mutate the input.
- Don't use `structuredClone` (it also drops prototypes and throws on functions, which doesn't match the table above).

## Follow-up

- Why use a `WeakMap` rather than a `Map` for the "already cloned" lookup?
- What can't be cloned this way (private fields, closures, DOM nodes, `WeakMap`)?
- How would you make the algorithm iterative?
