/**
 * Counts elements by the key returned from `iteratee`.
 *
 * @template T
 * @param {Array<T>} array
 * @param {((value: T) => unknown) | string} iteratee
 * @return {Record<string, number>}
 */
export default function countBy(array, iteratee) {
  const getKey = typeof iteratee === 'function' ? iteratee : (value) => value[iteratee];
  const result = {};

  for (const element of array) {
    const key = String(getKey(element));
    result[key] = Object.hasOwn(result, key) ? result[key] + 1 : 1;
  }

  return result;
}
