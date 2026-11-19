## TL;DR

Use **spread syntax** `[...set]` or **`Array.from(set)`**. Both iterate the Set in **insertion order** and produce a new, shallow array. `Array.from(set, mapFn)` lets you transform values in the same pass. Combined with `new Set(array)`, this is the idiomatic way to **dedupe an array**.

## The options

```js
const set = new Set(['b', 'a', 'c']);

[...set];                          // ['b', 'a', 'c']
Array.from(set);                   // ['b', 'a', 'c']
Array.from(set, (s) => s.toUpperCase()); // ['B', 'A', 'C'], map while converting

// less common
const arr = [];
set.forEach((v) => arr.push(v));
Array.from(set.values());          // same as Array.from(set)
```

Dedupe:

```js
const ids = [3, 1, 3, 2, 1];
const uniqueIds = [...new Set(ids)]; // [3, 1, 2], first occurrence order kept
```

Map conversions work the same way:

```js
const map = new Map([['a', 1], ['b', 2]]);
[...map];          // [['a', 1], ['b', 2]]
[...map.keys()];   // ['a', 'b']
Array.from(map.values()); // [1, 2]
```

## Spread vs `Array.from`

| | `[...set]` | `Array.from(set)` |
|---|---|---|
| Works on | Iterables only | Iterables **and** array-likes (`{ length: 2, 0: 'x', 1: 'y' }`) |
| Mapping | Needs a separate `.map()` (extra array) | Built-in `mapFn` |
| Readability | Short, idiomatic | Explicit |
| TypeScript | Needs `downlevelIteration` or ES2015+ target | Works with older targets |

Both are O(n) and fast. Prefer whichever reads better; use `Array.from` when you'd otherwise spread and immediately `.map()`.

## Gotchas

- **Shallow copy**: objects inside the Set are the same references in the array.
- **Old TypeScript targets**: with `target: ES5` and no `downlevelIteration`, `[...set]` used to compile to `[].concat(set)` or `slice`, giving `[Set]` instead of its values. `Array.from` avoided that bug.
- **Dedupe by object content doesn't work** with `new Set(arrayOfObjects)` because Sets compare objects by reference. Dedupe by a key instead:

```js
const uniqueById = [...new Map(users.map((u) => [u.id, u])).values()];
```

(Last occurrence wins for duplicate IDs, while positions follow the first occurrence.)

## Do you need an array at all?

Often you convert only to use array methods. Alternatives:

- Membership checks: keep the Set (`set.has(x)` is O(1), `arr.includes(x)` is O(n)).
- Set algebra: use `union`, `intersection`, `difference` (ES2025) instead of filtering arrays.
- Iterator helpers (ES2025): `set.values().filter(fn).map(fn).toArray()` processes lazily without intermediate arrays, in engines that support them.
- Sorting requires an array: `[...set].sort()` or `[...set].toSorted()`.

## In an interview, mention…

- `[...set]` and `Array.from(set, mapFn)`, insertion order, shallow copy.
- The `new Set` dedupe idiom and its reference-equality limitation for objects.
- That keeping data in a Set may be the better choice for lookups.
