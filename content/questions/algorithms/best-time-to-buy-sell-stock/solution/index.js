/**
 * @param {number[]} prices
 * @return {number}
 */
export default function maxProfit(prices) {
  let minPrice = Infinity;
  let best = 0;

  for (const price of prices) {
    best = Math.max(best, price - minPrice);
    minPrice = Math.min(minPrice, price);
  }

  return best;
}
