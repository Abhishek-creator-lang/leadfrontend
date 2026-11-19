/**
 * @param {number[]} sorted Ascending, no duplicates.
 * @param {number} target
 * @return {number} Index of target, or -1.
 */
export default function binarySearch(sorted, target) {
  let lo = 0;
  let hi = sorted.length - 1;

  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    const value = sorted[mid];
    if (value === target) return mid;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}
