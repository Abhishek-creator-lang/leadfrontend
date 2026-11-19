/**
 * Returns the index of the last element (searching backwards from `fromIndex`)
 * that satisfies `predicate`, or -1.
 *
 * @template T
 * @param {Array<T>} array
 * @param {(value: T, index: number, array: Array<T>) => unknown} predicate
 * @param {number} [fromIndex=array.length - 1]
 * @return {number}
 */
export default function findLastIndex(array, predicate, fromIndex = array.length - 1) {
  const start = fromIndex < 0 ? array.length + fromIndex : Math.min(fromIndex, array.length - 1);

  for (let i = start; i >= 0; i--) {
    if (predicate(array[i], i, array)) return i;
  }
  return -1;
}
