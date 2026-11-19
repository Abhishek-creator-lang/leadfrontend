## Step 1 in every approach: count

One pass with a `Map` from value to count. A `Map` keeps `1` and `'1'` apart, while an object would merge them into the key `'1'`. That's O(n).

## Brute force: sort the distinct values by count

`[...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, k)` takes O(d log d) for d distinct values. It's perfectly fine to say first, and often the right production answer.

## Better: a min-heap of size k

Walk the counts and keep a min-heap (by count) holding the best k seen so far. When it grows past k, pop the smallest. That's O(d log k), which is a win when k is much smaller than d (top 3 out of 50,000 values).

## Optimal: bucket sort by frequency (reference)

A count is always between 1 and n. Make `buckets[c]` = the list of values that occur exactly c times. Then walk the buckets from `n` down to `1`, collecting values until you have k.

- **Time:** O(n). Counting is O(n), filling the buckets O(d), and the walk O(n).
- **Space:** O(n) for the buckets and the map.

## Complexity summary

| Approach | Time | Extra space |
|---|---|---|
| Sort the entries | O(n + d log d) | O(d) |
| Heap of size k | O(n + d log k) | O(d + k) |
| Buckets | O(n) | O(n) |
| Quickselect on counts | O(n) average | O(d) |

## Edge cases

- `k` equal to the number of distinct values → return all of them.
- Mixed types: `1` vs `'1'`.
- A single item.
- The prompt guarantees no tie at position k. Ask what should happen if there is one, since a real UI usually needs a deterministic tie-break (alphabetical, or most recent).

## Talking through it in an interview

Count first, then say "now it's a top-k selection over d (value, count) pairs" and lay out the options with their trade-offs. Implement buckets or the heap, whichever the interviewer prefers. Mention that for k = 1 a single max pass is enough.

## Follow-ups

- **Streaming top-k:** keep the count map plus an ordered structure (or a heap with lazy deletion). For small k, rescanning a few hundred distinct emoji on each update is fine. Measure before optimising.
- **Approximate counting for huge streams:** Count-Min Sketch plus a heap, or the Space-Saving / Misra–Gries algorithms. These are the standard "heavy hitters" answers.
- **Rendering:** debounce re-sorting the UI so a burst of reactions doesn't re-render the widget hundreds of times per second.
