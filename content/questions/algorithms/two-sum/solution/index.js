/**
 * @param {number[]} prices
 * @param {number} target
 * @return {[number, number]} Indices i < j such that prices[i] + prices[j] === target.
 */
export default function twoSum(prices, target) {
  const seen = new Map(); // price -> index

  for (let j = 0; j < prices.length; j++) {
    const need = target - prices[j];
    if (seen.has(need)) return [seen.get(need), j];
    if (!seen.has(prices[j])) seen.set(prices[j], j);
  }

  return null;
}
