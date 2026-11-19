## The recurrence

Look at the **last move** into screen `n`. It was either a 1-step from `n - 1` or a 2-step from `n - 2`. Those two groups don't overlap and together cover every path, so:

```
ways(n) = ways(n - 1) + ways(n - 2),   ways(0) = 1, ways(1) = 1
```

That's the Fibonacci sequence shifted by one.

## Brute force: direct recursion

```js
const ways = (n) => (n <= 1 ? 1 : ways(n - 1) + ways(n - 2));
```

It's correct but takes O(φⁿ) time (about 1.6ⁿ), because `ways(n - 2)` is computed inside `ways(n - 1)` **and** again directly, and that duplication compounds at every level. `ways(50)` takes billions of calls.

## Memoisation (top-down)

Cache each `ways(k)` in a `Map` or array the first time it's computed. Every value is computed once, so it's O(n) time and O(n) space, plus recursion depth n.

## Optimal: bottom-up with two variables

Only the previous two values are ever needed:

```js
let prev = 1, curr = 1;            // ways(0), ways(1)
for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr];
return curr;
```

That's O(n) time and O(1) space.

## Complexity

| Approach | Time | Space |
|---|---|---|
| Plain recursion | O(φⁿ) | O(n) stack |
| Memoised | O(n) | O(n) |
| Two variables | O(n) | O(1) |
| Matrix power | O(log n) | O(1) |

## Edge cases

- `n = 0` → 1 (the empty path). Clarify this with the interviewer.
- `n = 1` → 1.
- Large n: answers grow exponentially. `ways(70)` ≈ 3 × 10¹⁴ is safe, but around n ≈ 77 you pass `2^53` and need `BigInt`.

## Talking through it in an interview

Write the brute force recursion, draw its call tree for n = 5 to **show** the repeated subtrees, then add a memo, then collapse it to two variables. That progression (recursion → memo → table → constant space) is the template for every 1-D DP problem, and interviewers use this question to check you know it.

## Follow-ups

- **Arbitrary step sizes** `S`: `ways(n) = Σ ways(n - s)` for each `s ∈ S` with `s ≤ n`. That's O(n · |S|) with a rolling window.
- **O(log n):** `[[1,1],[1,0]]^n` gives Fibonacci numbers. Use fast exponentiation by squaring.
- **Costs per step** (minimum-cost climbing) change the `+` to `min(...) + cost`, the same DP shape.
