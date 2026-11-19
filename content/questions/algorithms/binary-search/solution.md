## Brute force

Scan left to right and return the first index whose value equals `target`. That is O(n) and ignores the one thing the input promises: it's sorted.

## Optimal: halve the search space each step

Keep a window `[lo, hi]` that must contain `target` if it's present at all. Look at the middle element:

- equal → found it;
- smaller than `target` → everything left of `mid` is smaller too, so set `lo = mid + 1`;
- larger → set `hi = mid - 1`.

When `lo > hi` the window is empty and the answer is `-1`.

`mid` is computed as `lo + ((hi - lo) >> 1)`. In JavaScript `(lo + hi) / 2` can't overflow for array indices, but writing it this way shows you know why it matters in languages with fixed-width integers, and the shift floors for free.

## Complexity

- **Time:** O(log n). Each comparison halves the window, so a million rows take about 20 steps.
- **Space:** O(1) for the iterative version. A recursive version uses O(log n) stack.

## Edge cases

- Empty array: `hi = -1`, so the loop never runs and the result is `-1`.
- Single element, target at either end, target smaller than everything or larger than everything.
- Off-by-one bugs: use **either** an inclusive `[lo, hi]` window with `while (lo <= hi)` **or** a half-open `[lo, hi)` window with `while (lo < hi)` and `hi = mid`. Mixing the two causes infinite loops or skipped elements.

## Talking through it in an interview

State the loop invariant ("if `target` exists, it's within `[lo, hi]`") before writing code. Then every line is about keeping that invariant true. Trace a two-element array by hand. That's where off-by-one errors show up.

## Follow-ups

- **Lower bound** (first index with `value ≥ target`): use the half-open form. If `sorted[mid] < target` then `lo = mid + 1`, else `hi = mid`. Return `lo`. This is exactly what a virtualised list does to map a scroll offset to the first visible row.
- **Duplicates, first occurrence:** run lower bound and check that the value at that index equals `target`.
- **Binary search on the answer:** the same idea works on any monotonic predicate, such as the smallest font size at which a label fits.
