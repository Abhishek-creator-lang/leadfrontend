## TL;DR

A **`Map`** is a purpose-built key/value collection: **any value can be a key** (objects, functions, `NaN`), it keeps **insertion order**, has a **`size`**, is **directly iterable** and has **no inherited keys**. A **plain object** is a record with **string/symbol keys only**, an inherited prototype, and first-class **JSON** and literal syntax. Use objects for **fixed-shape records**; use `Map` for **dynamic dictionaries**, especially with non-string keys or frequent additions/removals.

## Side by side

```js
const user = { id: 1, name: 'Ada' };          // record: known fields

const visits = new Map();                      // dictionary: unknown, changing keys
const el = document.body;
visits.set(el, 3).set('home', 10).set(42, 'n');
visits.get(el);   // 3
visits.size;      // 3
visits.has(42);   // true (the key stays a number, not '42')
for (const [key, val] of visits) console.log(key, val);
```

| | `Map` | Plain object |
|---|---|---|
| Key types | Any value, compared with SameValueZero | Strings and symbols (numbers are converted to strings) |
| Order | Insertion order | Integer-like keys first (ascending), then strings in insertion order, then symbols |
| Size | `map.size` | `Object.keys(obj).length` (O(n)) |
| Iteration | Iterable: `for…of`, `map.entries()` | Need `Object.entries` / `for…in` |
| Inherited keys | None | Has `Object.prototype` unless `Object.create(null)` |
| JSON | Not serialised (`{}`); convert with `Object.fromEntries` | Native |
| Syntax | Method calls | Literals, destructuring, spread, dot access |
| Performance | Optimised for frequent add/delete | Optimised for stable shapes (hidden classes) |

## Why prototype keys matter

```js
const counts = {};
for (const w of ['constructor', 'a']) counts[w] = (counts[w] ?? 0) + 1;
counts.constructor; // "function Object() {…}1": inherited key polluted the result
```

With user-controlled keys, a plain object also risks **prototype pollution** (`__proto__` keys in merged JSON). A `Map`, or `Object.create(null)` with `Object.hasOwn`, avoids this.

## Converting

```js
const m = new Map(Object.entries({ a: 1, b: 2 }));
const o = Object.fromEntries(m);
JSON.stringify([...m]); // '[["a",1],["b",2]]'
```

ES2024 added **grouping** helpers that return one of each:

```js
Object.groupBy(users, (u) => u.role); // null-prototype object keyed by string
Map.groupBy(users, (u) => u.team);    // Map, so keys can be objects
```

## Pitfalls

- `map[key] = value` sets a **property on the Map object**, not an entry. Always use `set`/`get`.
- Object keys in a `Map` are compared by **reference**: `map.get({ id: 1 })` won't find an entry set with a different object literal.
- A `Map` holds its keys strongly. To associate data with objects without preventing garbage collection, use a `WeakMap`.
- In React state, `Map` updates need a new `Map` (`new Map(prev).set(k, v)`) because mutating in place won't trigger a re-render.

## In an interview, mention…

- Records vs dictionaries as the deciding question.
- Non-string keys, guaranteed ordering, `size` and no prototype collisions are the `Map` advantages; JSON and ergonomic syntax favour objects.
- The `WeakMap` follow-up and the security angle (prototype pollution).
