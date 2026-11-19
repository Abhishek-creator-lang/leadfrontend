/**
 * Drops elements from the start of `array` while `predicate` returns truthy.
 *
 * @template T
 * @param {Array<T>} array
 * @param {(value: T, index: number, array: Array<T>) => unknown} predicate
 * @return {Array<T>}
 */
export default function dropWhile(array, predicate) {
  let index = 0;
  while (index < array.length && predicate(array[index], index, array)) {
    index++;
  }
  return array.slice(index);
}
