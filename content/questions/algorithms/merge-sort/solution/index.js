/**
 * Returns a new array sorted in ascending order. Does not mutate the input.
 * @param {number[]} numbers
 * @return {number[]}
 */
export default function mergeSort(numbers) {
  const result = numbers.slice();
  const buffer = new Array(result.length);
  sortRange(result, buffer, 0, result.length);
  return result;
}

// Sorts arr[lo, hi) in place, using buffer as scratch space.
function sortRange(arr, buffer, lo, hi) {
  if (hi - lo < 2) return;
  const mid = lo + ((hi - lo) >> 1);
  sortRange(arr, buffer, lo, mid);
  sortRange(arr, buffer, mid, hi);
  merge(arr, buffer, lo, mid, hi);
}

// Merges the sorted runs arr[lo, mid) and arr[mid, hi).
function merge(arr, buffer, lo, mid, hi) {
  for (let k = lo; k < hi; k++) buffer[k] = arr[k];

  let i = lo;
  let j = mid;
  let k = lo;
  while (i < mid && j < hi) {
    // `<=` takes from the left run on ties, which keeps the sort stable.
    arr[k++] = buffer[i] <= buffer[j] ? buffer[i++] : buffer[j++];
  }
  while (i < mid) arr[k++] = buffer[i++];
  while (j < hi) arr[k++] = buffer[j++];
}
