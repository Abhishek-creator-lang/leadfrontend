/**
 * @param {number[]} revenue Non-negative revenue per slot.
 * @return {number} Max total from non-adjacent slots.
 */
export default function maxRevenue(revenue) {
  let prev2 = 0; // best using slots up to i - 2
  let prev1 = 0; // best using slots up to i - 1

  for (const r of revenue) {
    const current = Math.max(prev1, r + prev2);
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
