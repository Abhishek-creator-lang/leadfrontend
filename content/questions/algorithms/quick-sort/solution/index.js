/**
 * Sorts the array in place in ascending order and returns it.
 * @param {number[]} numbers
 * @return {number[]}
 */
export default function quickSort(numbers) {
  sortRange(numbers, 0, numbers.length - 1);
  return numbers;
}

function swap(a, i, j) {
  const tmp = a[i];
  a[i] = a[j];
  a[j] = tmp;
}

// Sorts a[lo..hi] inclusive.
function sortRange(a, lo, hi) {
  while (lo < hi) {
    const pivot = a[lo + Math.floor(Math.random() * (hi - lo + 1))];

    // Three-way partition:
    // a[lo..lt-1] < pivot, a[lt..i-1] === pivot, a[gt+1..hi] > pivot.
    let lt = lo;
    let i = lo;
    let gt = hi;
    while (i <= gt) {
      if (a[i] < pivot) swap(a, lt++, i++);
      else if (a[i] > pivot) swap(a, i, gt--);
      else i++;
    }

    // Recurse into the smaller side and loop on the larger one to keep the stack O(log n).
    if (lt - lo < hi - gt) {
      sortRange(a, lo, lt - 1);
      lo = gt + 1;
    } else {
      sortRange(a, gt + 1, hi);
      hi = lt - 1;
    }
  }
}
