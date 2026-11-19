## Approach

Like `isEmpty`, this is a type dispatch. Check the specific types before the generic object rule:

1. `collection == null` → `0`.
2. Strings → count code points. `[...str].length` works because the string iterator yields code points, so a surrogate pair (an emoji outside the Basic Multilingual Plane) is one item. A loop with `for (const ch of str) count++` does the same without allocating an array.
3. Arrays, typed arrays, `arguments` → `length`.
4. `Map` / `Set` → `size`.
5. Other objects and functions → `Object.keys(collection).length`.
6. Remaining primitives → `0`.

`Map` and `Set` must come before step 5: their entries aren't properties, so `Object.keys(new Map([[1, 1]]))` is `[]`.

## Strings: three different "lengths"

| Measure | `'😀'` | `'👍🏽'` | How |
|---|---|---|---|
| UTF-16 code units | 2 | 4 | `str.length` |
| Code points | 1 | 2 | `[...str].length` |
| Grapheme clusters (what users see) | 1 | 1 | `Intl.Segmenter` |

This prompt asks for code points. For a character counter in a UI (a tweet box, an SMS field), graphemes are what users expect:

```js
const count = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(str)].length;
```

And for a server-side limit, you may need bytes (`new TextEncoder().encode(str).length`). Asking "which length?" is the senior-level move.

## Complexity

- Strings: O(n) to count code points.
- Arrays, maps, sets: O(1).
- Objects: O(k) for k keys (`Object.keys` builds the array).

## Edge cases

- Sparse arrays report their `length`, holes included: `size([, ,])` is `2`.
- `{ length: 5 }` is a plain object with one key, so its size is `1`. Only real arrays, typed arrays and `arguments` use `length`. (lodash would treat it as array-like and return `5`; our rules are stricter on purpose.)
- Functions have only non-enumerable own properties by default, so their size is `0`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `str.length` | Emoji and other astral characters count twice |
| Treating anything with a numeric `length` as array-like | `{ length: 5 }` and functions (which have `length` = arity) give wrong answers |
| `Object.keys` before the `Map`/`Set` check | Every map and set has size `0` |
| `for…in` without an own-property check | Counts inherited enumerable keys |

## Follow-ups interviewers ask

- **Graphemes:** use `Intl.Segmenter`, as above. It's available in all modern browsers and Node 16+.
- **`.length` on a `Map`:** a `Map` isn't an array-like; it exposes `size` as a getter on `Map.prototype`. `map.length` is simply `undefined`.
- **Iterables in general:** a generic `size` could fall back to counting `for…of` iterations, but that consumes one-shot iterators such as generators.
