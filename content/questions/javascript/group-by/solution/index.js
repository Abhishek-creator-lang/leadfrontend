/**
 * Groups elements by the key returned from `iteratee`.
 *
 * @template T
 * @param {Array<T>} array
 * @param {((value: T) => unknown) | string} iteratee
 * @return {Record<string, Array<T>>}
 */
export default function groupBy(array, iteratee) {
  const getKey = typeof iteratee === 'function' ? iteratee : (value) => value[iteratee];
  const result = {};

  for (const element of array) {
    const key = String(getKey(element));
    if (Object.hasOwn(result, key)) {
      result[key].push(element);
    } else {
      result[key] = [element];
    }
  }

  return result;
}
