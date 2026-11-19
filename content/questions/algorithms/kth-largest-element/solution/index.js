/**
 * @param {number[]} values
 * @param {number} k 1 = the maximum.
 * @return {number}
 */
export default function kthLargest(values, k) {
  const a = values.slice(); // never mutate the caller's array
  const target = a.length - k; // index of the answer in ascending order
  let lo = 0;
  let hi = a.length - 1;

  while (lo < hi) {
    const pivot = a[lo + Math.floor(Math.random() * (hi - lo + 1))];

    // Three-way partition of a[lo..hi]: < pivot | === pivot | > pivot.
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (a[i] < pivot) {
        [a[lt], a[i]] = [a[i], a[lt]];
        lt++;
        i++;
      } else if (a[i] > pivot) {
        [a[i], a[gt]] = [a[gt], a[i]];
        gt--;
      } else {
        i++;
      }
    }

    if (target < lt) hi = lt - 1;
    else if (target > gt) lo = gt + 1;
    else return pivot;
  }

  return a[target];
}
