## Brute force

Enumerate all 2ⁿ subsequences and keep the longest increasing one. It's hopeless beyond about 25 elements.

## Step 2: O(n²) DP

`len[i]` = the length of the longest increasing subsequence that **ends at index i**. It is 1 plus the best `len[j]` over earlier `j` with `values[j] < values[i]`:

```
len[i] = 1 + max(len[j] for j < i where values[j] < values[i])   (or 1 if none)
```

The answer is `max(len)`. It's correct and easy to explain, but 10⁵ elements means about 5 × 10⁹ comparisons.

## Optimal: patience sorting, O(n log n)

Maintain `tails`, where `tails[k]` is the **smallest possible tail value** of any increasing subsequence of length `k + 1` seen so far. `tails` is always strictly increasing, so it can be binary-searched.

For each value `x`:

- find the first index `k` with `tails[k] >= x` (a lower bound);
- if there's none, `x` extends the longest subsequence, so push it;
- otherwise set `tails[k] = x`. You now have a length-`k+1` subsequence with a smaller tail, which is easier to extend later.

The answer is `tails.length`.

Using `>=` (lower bound) rather than `>` is what makes it **strictly** increasing: an equal value replaces a tail instead of extending past it.

Note that `tails` is **not** itself a valid subsequence. It mixes elements from different candidates. Only its length is meaningful. That's a classic interview gotcha.

## Complexity

| Approach | Time | Space |
|---|---|---|
| All subsequences | O(2ⁿ · n) | O(n) |
| DP | O(n²) | O(n) |
| Patience sorting | O(n log n) | O(n) |

## Edge cases

- Empty → 0; one element → 1.
- All equal → 1 (strictness).
- Strictly decreasing → 1; strictly increasing → n.
- Negative numbers.

## Talking through it in an interview

Present the O(n²) DP first. It shows you can define the state. Then ask: "for each length, which ending value matters?" Only the smallest one does, which leads to `tails` and binary search. Say explicitly that `tails` isn't the answer sequence.

## Follow-ups

- **Reconstruct the sequence:** for each element, store the index currently in `tails[k]` and a `prev` pointer to the index in `tails[k - 1]`. Then walk back from the last tail.
- **Front-end connection:** Vue 3's renderer computes an LIS over the new positions of keyed children. Nodes in the LIS stay put and only the others are moved with `insertBefore`, which minimises DOM moves.
- **Non-decreasing variant:** use an upper bound (`> x`) instead of a lower bound.
