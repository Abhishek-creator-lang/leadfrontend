## Brute force (the textbook version that breaks)

The simplest quicksort takes the **last** element as the pivot and uses a Lomuto partition (`< pivot` to the left, everything else to the right). It is correct, but:

- On **sorted input**, the last element is the maximum, so one side is always empty. Recursion depth becomes n and the time O(n²). With 50,000 items that also overflows the call stack.
- On **all-equal input**, every element goes to one side, with the same result.

A "functional" version that builds `left`/`right` arrays with `filter` is easy to read, but it allocates O(n) per level and has the same pivot problems.

## Optimal: random pivot + three-way partition + recurse on the smaller side

1. **Random pivot.** Choosing a random index makes the O(n²) case vanishingly unlikely for any input order, including sorted.
2. **Three-way (Dutch national flag) partition.** Split the range into `< pivot`, `=== pivot` and `> pivot` with three pointers `lt`, `i` and `gt`:
   - `a[i] < pivot` → swap with `a[lt]`, advance both;
   - `a[i] > pivot` → swap with `a[gt]`, decrement `gt` (don't advance `i`: the swapped-in value hasn't been examined);
   - equal → advance `i`.

   Equal keys end up in the middle and are never touched again, so an all-equal array is sorted in a single O(n) pass.
3. **Recurse on the smaller side, loop on the larger.** This bounds the recursion depth at O(log n) even in unlucky cases.

## Complexity

- **Time:** O(n log n) expected; O(n²) worst case, with negligible probability once the pivot is random.
- **Space:** O(log n) stack. It sorts in place, with no auxiliary arrays.
- **Not stable:** long-distance swaps can reorder equal keys. That's irrelevant for plain numbers but matters for records.

## Edge cases

- Empty or single-element arrays: return immediately.
- Sorted, reverse sorted, all equal, few distinct values.
- Return the **same** reference, since callers may rely on in-place behaviour.

## Talking through it in an interview

Write the partition function first and narrate its invariant: `a[lo..lt-1] < p`, `a[lt..i-1] === p`, `a[gt+1..hi] > p`. Then explain why naive pivots fail on sorted data. Interviewers often ask exactly that, so raise it before they do.

## Follow-ups

- **Why it's fast in practice:** sequential memory access, in-place swaps and a small inner loop. Merge sort copies to a buffer.
- **Introsort** (used by many C++ standard libraries) starts as quicksort and switches to heap sort if recursion gets too deep, which guarantees O(n log n).
- **Quickselect:** after partitioning, recurse only into the side that contains index k. That's O(n) expected; see *Kth Largest Element*.
