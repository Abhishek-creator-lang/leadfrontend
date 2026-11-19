## Approach

1. **Normalise the iteratee.** If it's a string, turn it into `(el) => el[iteratee]`. After that, the loop doesn't care which form was passed.
2. **Single pass.** For each element compute `key = String(getKey(element))`. If the group doesn't exist yet, create `[]`. Then push the element.
3. **Own-key check.** Use `Object.hasOwn(result, key)` to decide whether the group exists.

Step 3 is the part most candidates get wrong. With a plain `{}` and the check `if (!result[key])`, the key `'constructor'` finds the inherited `Object` function, which is truthy, so no array is created and `result.constructor.push(el)` throws "push is not a function". `key in result` has the same problem, because `in` walks the prototype chain.

The two correct options:

| Option | Trade-off |
|---|---|
| `Object.hasOwn(result, key)` on a normal `{}` | Result is a normal object, but `'__proto__'` as a key still hits the inherited setter |
| Accumulate into `Object.create(null)` | No inherited keys at all, `'__proto__'` is a normal key, but the result has no `hasOwnProperty`/`toString` methods |

`Object.groupBy` picks the second option: it returns a **null-prototype object**. That's the answer to the first follow-up, and the reason is exactly this collision problem.

## Complexity

- **Time:** O(n) iteratee calls plus O(1) average per insert.
- **Space:** O(n): every element appears in exactly one group.

## Edge cases

- `null`, `undefined`, booleans and numbers become `'null'`, `'undefined'`, `'true'`, `'4'`.
- Elements missing the property (string iteratee) all go into `'undefined'`.
- Key order follows JavaScript property order: integer-like keys first (ascending), then other strings in insertion order. If the order of groups matters, return a `Map` or an array of `[key, items]`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `result[key] = result[key] \|\| []` | Breaks on `'constructor'`, `'toString'`, … |
| `reduce` with `({ ...acc, [key]: [...(acc[key] ?? []), el] })` | O(n²) copying; slow at a few thousand items |
| Passing the iteratee to `array.map` and then grouping | Calls `iteratee(el, index, array)`, which breaks `parseInt`-style functions |
| Cloning elements into groups | Breaks identity (`===`) checks and wastes memory |

## Using it in React

Grouping is derived data. Compute it with `useMemo(() => groupBy(items, 'status'), [items])` (or in a selector) instead of storing the grouped result in state. Storing both the list and its grouping in state means they can drift apart. For very large lists, group on the server or in a worker.

## Follow-ups interviewers ask

- **`Map.groupBy`:** keys keep their type (objects can be keys, `1` and `'1'` stay separate). Use it when the keys aren't naturally strings.
- **Nested grouping:** `groupBy` the top level, then map over the entries and group each bucket again. A generic `groupByPath(array, [fn1, fn2])` recurses on the list of key functions.
- **Partition:** grouping by a boolean is `partition`, which returns `[matches, rest]`.
