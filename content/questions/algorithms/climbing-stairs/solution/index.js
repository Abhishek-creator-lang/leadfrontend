/**
 * @param {number} n Number of screens, 0 <= n <= 70.
 * @return {number} Number of 1-or-2-step sequences that land exactly on screen n.
 */
export default function countPaths(n) {
  let prev = 1; // ways(i - 2)
  let curr = 1; // ways(i - 1)
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}
