/**
 * @param {number[]} values
 * @return {number} Length of the longest strictly increasing subsequence.
 */
export default function lisLength(values) {
  // tails[k] = smallest tail of any increasing subsequence of length k + 1.
  const tails = [];

  for (const x of values) {
    // Lower bound: first index with tails[i] >= x.
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(x);
    else tails[lo] = x;
  }

  return tails.length;
}
