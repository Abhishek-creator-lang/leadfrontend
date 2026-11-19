## Approach

Treat `this` and every argument the same way: walk the list `[O, ...items]` and decide, per value, whether to **spread** it or **append** it.

1. Wrap the receiver with `Object(this)` (and reject `null`/`undefined`).
2. Keep a write cursor `n` into a fresh result array.
3. For each value:
   - If it is spreadable, loop `k` from `0` to its `length`. When `k in value`, copy `value[k]` to `result[n]`. Always advance `n`, even for holes, so the gaps line up.
   - Otherwise, write the value to `result[n]` and advance `n`.
4. Set `result.length = n` at the end. Without this, trailing holes would be lost, because writing nothing never grows an array.

## The spreadable check

```js
function isConcatSpreadable(value) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
  const flag = value[Symbol.isConcatSpreadable];
  if (flag !== undefined) return Boolean(flag);
  return Array.isArray(value);
}
```

Order matters. The symbol is checked first, so an array can opt **out** (`arr[Symbol.isConcatSpreadable] = false`), and an array-like object can opt **in**. Primitives are never spread, which is why `'ab'` is appended as one element instead of becoming `'a', 'b'`.

## Complexity

O(N) time and space, where N is the total number of output slots (the sum of spread lengths plus the number of appended values).

## Edge cases

- **Holes:** `k in value` tells a hole apart from a slot that holds `undefined`. `[1, , 3].concat([4])` keeps index 1 missing, so `1 in result` is `false`.
- **Trailing holes:** `[1, ,].concat()` has length 2. The final `result.length = n` keeps that.
- **No arguments:** you get a shallow copy, which is a common idiom from before spread syntax existed.
- **Shallow:** nested arrays are copied by reference: `[[1]].concat()[0]` is the same inner array.
- **Array-likes:** `arguments` or a NodeList is appended as a single element unless it opts in through the symbol.

## Common mistakes

- Using `result.push(value[k])` for every index. It turns holes into real `undefined` entries.
- Spreading anything that has a `length`, such as strings and array-likes.
- Flattening recursively. `concat` only goes one level deep.
- Mutating `this` with `push`, which turns `concat` into an in-place append.

## `concat` vs spread

`[...a, ...b]` uses the **iterator** protocol: it works for any iterable (Sets, strings, generators) and turns holes into `undefined`. `concat` uses `length` plus indexed access, preserves holes, ignores iterability, and honours `Symbol.isConcatSpreadable`. So `[...'ab']` gives `['a', 'b']`, but `[].concat('ab')` gives `['ab']`.

## Follow-ups

- **Species:** the native method creates its result with `ArraySpeciesCreate`, so a subclass `class MyArr extends Array` gets a `MyArr` back. A full polyfill would read `this.constructor[Symbol.species]`.
- **Performance:** engines special-case dense arrays. A hand-rolled loop is fine for interviews but slower than the native method on large inputs.
- **Library use:** a collection class (for example an immutable list exposed as array-like) can set `Symbol.isConcatSpreadable = true` so `[].concat(myList)` behaves like an array.
