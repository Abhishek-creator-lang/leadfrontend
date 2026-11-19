/**
 * @param {number[]} packSizes Distinct positive integers.
 * @param {number} amount
 * @return {number} Fewest packs summing exactly to amount, or -1.
 */
export default function minPacks(packSizes, amount) {
  // dp[a] = fewest packs that make exactly a credits.
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const size of packSizes) {
      if (size <= a && dp[a - size] + 1 < dp[a]) {
        dp[a] = dp[a - size] + 1;
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}
