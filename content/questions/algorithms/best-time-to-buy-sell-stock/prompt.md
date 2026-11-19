A portfolio dashboard shows a "best possible trade" badge for each chart. Given `prices`, the closing price of a stock on consecutive days, write `maxProfit(prices)`, which returns the largest profit from **buying on one day and selling on a strictly later day**. If no trade makes money, return `0`.

```js
maxProfit([31, 27, 35, 29, 42, 38]); // 15 (buy at 27, sell at 42)
maxProfit([50, 40, 30, 20]);         // 0  (prices only fall)
maxProfit([10]);                     // 0  (no second day to sell on)
maxProfit([]);                       // 0
```

## Constraints

- Up to 10⁵ days. Aim for O(n) time and O(1) extra space.
- You must buy before you sell; you can't sell short.

## Follow-up

- Also return the buy and sell days, so the chart can highlight them.
- What if you could make unlimited trades (but hold at most one share at a time)?
