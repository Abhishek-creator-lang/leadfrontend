/**
 * @param {number[]} changes Non-empty.
 * @return {number} The largest sum of a non-empty contiguous run.
 */
export default function maxSubarraySum(changes) {
  let endingHere = changes[0];
  let best = changes[0];

  for (let i = 1; i < changes.length; i++) {
    const x = changes[i];
    // Either extend the current run or start a new one at x.
    endingHere = Math.max(x, endingHere + x);
    best = Math.max(best, endingHere);
  }

  return best;
}
