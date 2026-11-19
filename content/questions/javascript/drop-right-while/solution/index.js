/**
 * Drops elements from the end of `array` while `predicate` returns truthy.
 *
 * @template T
 * @param {Array<T>} array
 * @param {(value: T, index: number, array: Array<T>) => unknown} predicate
 * @return {Array<T>}
 */
export default function dropRightWhile(array, predicate) {
  let index = array.length - 1;
  while (index >= 0 && predicate(array[index], index, array)) {
    index--;
  }
  return array.slice(0, index + 1);
}
