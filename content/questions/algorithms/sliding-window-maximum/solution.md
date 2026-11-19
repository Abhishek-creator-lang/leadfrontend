## Brute force

For each of the `n - k + 1` windows, scan its `k` values for the max: O(n · k). With n = 10⁵ and k = 5 × 10⁴ that's 2.5 × 10⁹ operations, far too slow for a live dashboard.

## Better: a heap or sorted structure

Keep the window's values in a max-heap of `[value, index]` pairs. When reading the top, lazily discard entries whose index has slid out of the window. That's O(n log n). Good, but there's an O(n) solution.

## Optimal: monotonic deque

Keep a deque of **indices** whose values are in **decreasing** order from front to back. The front is always the current window's maximum.

For each new index `i`:

1. **Expire:** if the front index is `≤ i - k`, it has left the window, so remove it from the front.
2. **Dominate:** while the value at the back is `≤ samples[i]`, pop it from the back. A smaller, **older** value can never be the maximum again, because `samples[i]` is larger and will stay in the window longer.
3. Push `i` on the back.
4. Once `i ≥ k - 1`, record `samples[deque.front]`.

Every index is pushed once and popped at most once, so the total work is **O(n)** even though there's a loop inside a loop.

Using `<=` in step 2 drops equal older values too, which keeps the deque short. Either `<` or `<=` gives correct results.

**JS implementation detail:** `Array.prototype.shift` is O(n), so the reference uses a plain array plus a `head` index for the front, and `pop()` for the back.

## Complexity

- **Time:** O(n), amortised O(1) per sample.
- **Space:** O(k) for the deque, plus the output.

## Edge cases

- `k = 1` → the input itself (a copy).
- `k = n` → a single value, the global max.
- Strictly decreasing input: the deque grows to `k`, and expiry does the work.
- Strictly increasing input: each new value clears the deque.
- Duplicates and negatives.

## Talking through it in an interview

Start with the brute force, improve to the heap, then ask: "which values can never be the answer again?" That observation (older and smaller means useless) is the whole trick. Trace the deque on the example, and argue the O(n) bound by counting pushes and pops.

## Follow-ups

- **Online:** wrap the deque in a class with `push(sample)` that expires by sample count or by timestamp. It works the same with a time-based window (`timestamp < now - windowMs`).
- **Min at the same time:** run a second deque with increasing order.
- **Related "monotonic stack" problems:** next greater element, stock span, largest rectangle in a histogram.
