## TL;DR

A **`Set`** is a collection of **unique values** (any type) with fast `add`/`has`/`delete`. A **`Map`** is a collection of **key–value pairs where keys can be any value** (objects, functions, `NaN`), with fast lookup and a reliable `size`. Both **remember insertion order**, are **iterable**, and compare values with **SameValueZero**. Use them instead of arrays for membership checks and instead of plain objects for dynamic dictionaries.

## Set

```js
const tags = new Set(['js', 'css', 'js']);
tags.size;            // 2 (duplicates dropped)
tags.add('html');     // chainable: returns the set
tags.has('css');      // true, O(1) on average
tags.delete('css');   // true
for (const t of tags) console.log(t); // insertion order

const unique = [...new Set([3, 1, 3, 2])]; // [3, 1, 2]: dedupe an array
```

Set operations, built in since ES2025:

```js
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
a.union(b);               // Set {1, 2, 3, 4}
a.intersection(b);        // Set {2, 3}
a.difference(b);          // Set {1}
a.symmetricDifference(b); // Set {1, 4}
a.isSubsetOf(b);          // false
a.isDisjointFrom(new Set([9])); // true
```

Typical uses: visited nodes in a graph traversal, selected IDs in a multi-select, deduplication, permission checks, tracking in-flight requests.

## Map

```js
const cache = new Map();
cache.set('/api/user', { name: 'Ada' });
cache.get('/api/user');  // { name: 'Ada' }
cache.has('/missing');   // false
cache.size;              // 1

// any key type
const el = document.querySelector('#save');
const clicks = new Map([[el, 0]]);
clicks.set(el, clicks.get(el) + 1);

for (const [key, value] of cache) { /* insertion order */ }
cache.forEach((value, key) => {});
[...cache.keys()]; [...cache.values()]; [...cache.entries()];

// convert to / from objects
const m = new Map(Object.entries({ a: 1, b: 2 }));
const obj = Object.fromEntries(m);
```

Grouping (ES2024):

```js
const byStatus = Map.groupBy(orders, (o) => o.status);
byStatus.get('shipped'); // array of shipped orders
```

Typical uses: caches and memoization keyed by objects or strings, lookup tables built from API data (`id → entity`), counting frequencies, LRU caches (insertion order + delete/re-insert makes "least recently used" easy).

## Why not arrays and objects?

| Need | Array/Object | Set/Map |
|---|---|---|
| Membership test | `arr.includes(x)` is O(n) | `set.has(x)` is O(1) average |
| Non-string keys | Object keys are coerced to strings | Any value as key |
| Size | `Object.keys(o).length` is O(n) | `.size` |
| Accidental keys | `'toString' in {}` is true (prototype) | Starts empty |
| Frequent add/delete | `delete obj.k` can deopt objects | Designed for it |

## Pitfalls

- **Object keys are compared by reference.** `map.get({ id: 1 })` won't find an entry stored with a different `{ id: 1 }` object. Use a primitive key (the ID) instead.
- **Not JSON-serializable**: `JSON.stringify(new Map([[1, 2]]))` is `'{}'`. Convert with `Object.fromEntries` or `[...map]` first.
- **Not reactive by mutation**: in React state, `set.add(x)` mutates in place, so create a new Set/Map to trigger re-renders.
- **Memory**: a Map holding DOM nodes or objects keeps them alive. Use `WeakMap`/`WeakSet` when the key's lifetime should control the entry.

## In an interview, mention…

- Uniqueness (Set) and arbitrary keys (Map), with O(1) average operations and insertion order.
- New Set methods (`union`, `intersection`, …) and `Map.groupBy`.
- Reference equality for object keys, serialization, and WeakMap for lifetime-bound metadata.
