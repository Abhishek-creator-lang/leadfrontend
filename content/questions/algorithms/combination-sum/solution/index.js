/**
 * @param {number[]} sizes Distinct positive integers.
 * @param {number} target
 * @return {number[][]} Every distinct multiset of sizes summing to target.
 */
export default function combinationSum(sizes, target) {
  const sorted = sizes.slice().sort((a, b) => a - b);
  const result = [];
  const path = [];

  function explore(start, remaining) {
    if (remaining === 0) {
      result.push(path.slice());
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      const size = sorted[i];
      if (size > remaining) break; // sorted, so every later size is too big as well
      path.push(size);
      explore(i, remaining - size); // `i`, not `i + 1`: sizes can be reused
      path.pop();
    }
  }

  explore(0, target);
  return result;
}
