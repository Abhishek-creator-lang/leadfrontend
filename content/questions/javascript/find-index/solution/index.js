/**
 * Returns the index of the first element (from `fromIndex`) that satisfies `predicate`, or -1.
 *
 * @template T
 * @param {Array<T>} array
 * @param {(value: T, index: number, array: Array<T>) => unknown} predicate
 * @param {number} [fromIndex=0]
 * @return {number}
 */
export default function findIndex(array, predicate, fromIndex = 0) {
  const start = fromIndex < 0 ? Math.max(array.length + fromIndex, 0) : fromIndex;

  for (let i = start; i < array.length; i++) {
    if (predicate(array[i], i, array)) return i;
  }
  return -1;
}
