## Approach

Keep the invariant: **`numbers[0..i-1]` is sorted.** For each new index `i`:

1. Save `current = numbers[i]`. Its slot is now a "hole".
2. Walk `j` left from `i - 1` while `numbers[j] > current`, shifting each larger element one slot right into the hole.
3. Drop `current` into the hole at `j + 1`.

Shifting instead of swapping halves the number of writes compared with the swap-adjacent version, which is the "brute force" form most people write first:

```js
while (j >= 0 && a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; j--; }
```

Both are O(n²), but the shifting version does one write per step instead of three.

## Complexity

| Case | Time | Why |
|---|---|---|
| Best (already sorted) | O(n) | The inner loop exits immediately on every iteration |
| Average / worst (reversed) | O(n²) | Each element shifts past up to i others |

Space is O(1); the sort is in place.

More precisely, the running time is O(n + d), where d is the number of *inversions* (out-of-order pairs). That's why it's ideal for nearly-sorted data.

## Edge cases

- Empty and single-element arrays: the loop starting at `i = 1` doesn't run.
- Duplicates: compare with `>` (not `>=`) so equal elements don't hop over each other. That keeps the sort **stable**.
- Return the same reference.

## Talking through it in an interview

State the sorted-prefix invariant, draw the "hole" moving left, then write the eight lines of code. Mention the best case explicitly. Interviewers like candidates who know when an O(n²) algorithm is actually the right choice.

## Follow-ups

- **Hybrid sorts:** for n ≲ 16–32 elements, insertion sort's tiny constant factor and cache-friendly access beat the recursion overhead of merge or quick sort. V8's Timsort uses binary insertion sort to extend short runs.
- **Binary insertion sort:** find the insertion point with binary search (O(log i) comparisons). The shifting is still O(i), though.
- **Online sorting:** insertion sort can sort items as they arrive, for example inserting each new chat message into an already ordered list.
