## Approach

1. Normalise `fromIndex`:
   - negative: `length + fromIndex` (this may still be negative, which correctly means "nothing to search");
   - non-negative: `Math.min(fromIndex, length - 1)`.
2. Loop `for (let i = start; i >= 0; i--)` and return `i` on the first truthy predicate.
3. Return `-1` after the loop.

Note the asymmetry with `findIndex`. There, a too-negative `fromIndex` is clamped to `0` and the whole array is searched. Here, the search goes towards index `0`, so starting before `0` means there is nothing left to visit. The loop condition `i >= 0` handles that without a branch.

## Complexity

O(n) predicate calls in the worst case, O(1) extra space.

## Edge cases

- Empty array: `length - 1` is `-1`, the loop doesn't run, result `-1`.
- `fromIndex` larger than the array: clamped to the last index.
- `fromIndex = -100`: start index is negative, so `-1` without calling the predicate.
- Indices passed to the predicate are the real indices, not "distance from the end".

## Common mistakes

| Mistake | Consequence |
|---|---|
| `array.reverse().findIndex(…)` | Mutates the caller's array, and the returned index is from the reversed array |
| `[...array].reverse().findIndex(…)` | Works only if you convert the index back with `length - 1 - i` (and map `-1` separately), and it costs O(n) extra memory |
| Clamping a too-negative `fromIndex` to `0` | Searches index 0 when the spec says there's nothing to search |
| Not clamping a large `fromIndex` | Calls the predicate with `undefined` for indices past the end |

## Where "last match" matters

- Finding the most recent message from the current user to edit with the up arrow.
- Restoring focus to the last focusable element before a removed one.
- Finding the last completed step in a wizard.

## Follow-ups interviewers ask

- **Without the built-in:** a reverse index loop like the reference solution needs no copy and works in any engine. `findLastIndex` and `findLast` only arrived in ES2023.
- **Array-likes:** the loop uses only `length` and indexing, so it works on `arguments` and `NodeList` too.
- **Binary search:** if the array is sorted by the predicate (all `true` then all `false`, or the reverse), the boundary can be found in O(log n).
