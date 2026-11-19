## Brute force

Try every buy day `i` and every later sell day `j`, and keep the best `prices[j] - prices[i]`. That's O(n²): around 5 × 10⁹ comparisons for 10⁵ days.

## Optimal: track the cheapest price so far

Look at it from the **sell** day's point of view: the best trade that sells on day `j` buys at the lowest price seen *before* `j`. So one left-to-right pass needs just two variables:

- `minPrice`: the lowest price seen so far (the best buy day up to now);
- `best`: the best profit found so far.

For each price, first try selling today (`best = max(best, price - minPrice)`), then update `minPrice`. Updating after the profit check stops you buying and selling on the same day. That's harmless here since it gives 0, but it matters in variants.

This is a tiny case of **dynamic programming / Kadane-style thinking**: carry forward the one fact about the past that the future needs.

## Complexity

- **Time:** O(n).
- **Space:** O(1).

## Edge cases

- Empty array or a single day → 0.
- Strictly falling prices → 0, never negative. Initialising `best = 0` handles that.
- The lowest price occurs *after* the highest. The answer comes from a later, smaller rise, not from `max - min`. This is the trap in the "just subtract min from max" idea.
- Plateaus (repeated prices).

## Talking through it in an interview

Give the brute force, then ask "for a fixed sell day, which buy day is best?". The answer, the minimum so far, is the whole solution. Mention why `max(prices) - min(prices)` is wrong with a quick example like `[5, 1]`.

## Follow-ups

- **Return the days:** track `minIndex` alongside `minPrice`, and record `(minIndex, j)` whenever `best` improves.
- **Unlimited trades:** add up every positive day-to-day difference (`Σ max(0, p[i] - p[i-1])`), since capturing every upswing is optimal.
- **At most k trades / cooldowns / fees:** state-machine DP with "holding" and "not holding" states per day.
- **Charting connection:** the "max drawdown" metric (the biggest fall from a peak) is the mirror image: track the highest price so far.
