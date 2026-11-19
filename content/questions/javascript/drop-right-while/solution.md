## Approach

This is `dropWhile` mirrored. The question is **where does the kept part end?**

1. Start `index` at `array.length - 1`.
2. While `index >= 0` and `predicate(array[index], index, array)` is truthy, decrement `index`.
3. `index` is now the position of the last element to keep (or `-1` if everything was dropped). Return `array.slice(0, index + 1)`.

`slice(0, 0)` is `[]`, so the "all dropped" case works without a branch. If the last element already fails, `index + 1` is `array.length` and you get a full copy.

## Using `findLastIndex`

ES2023 added `Array.prototype.findLastIndex`, which scans from the end and stops on the first match:

```js
const last = array.findLastIndex((v, i, a) => !predicate(v, i, a));
return array.slice(0, last + 1);
```

Here `-1` (nothing failed, so drop everything) gives `slice(0, 0)`, which is correct. That's a nice contrast with `dropWhile`, where `findIndex`'s `-1` needs special handling.

## Complexity

- **Time:** O(k) predicate calls for k dropped elements (plus one), and O(n − k) to copy. O(n) overall.
- **Space:** O(n − k) for the result.

## Edge cases

- Empty array: no predicate calls, returns `[]`.
- Predicate receives the **original** index, not a reversed one. Reversing a copy first and calling `dropWhile` gets the indices wrong unless you translate them.
- Elements that match the predicate in the middle or the start are kept.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `array.reverse()` then `dropWhile` then `reverse()` | `reverse` mutates the caller's array, and the predicate gets wrong indices |
| `slice(0, index)` instead of `slice(0, index + 1)` | Drops one element too many |
| Using `pop()` on the input | Mutates the caller's array |
| Filtering instead of scanning | Removes matching elements anywhere, not just at the end |

## Follow-ups interviewers ask

- **`takeRightWhile`:** return `array.slice(index + 1)`.
- **String trimming:** `trimEnd` is `dropRightWhile` over characters with a whitespace predicate. Asking a candidate to generalise to `trimEndBy(str, chars)` is a common extension.
