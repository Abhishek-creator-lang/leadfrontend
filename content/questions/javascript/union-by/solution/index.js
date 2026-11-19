/**
 * Creates an array of unique elements from all given arrays, where uniqueness is
 * decided by `iteratee`. The last argument is the iteratee.
 *
 * Usage: unionBy(array1, array2, ..., iteratee)
 *
 * @param {...(Array<unknown> | Function | string)} args
 * @return {Array<unknown>}
 */
export default function unionBy(...args) {
  const iteratee = args[args.length - 1];
  const arrays = args.slice(0, -1);
  const getKey = typeof iteratee === 'function' ? iteratee : (element) => element[iteratee];

  const seen = new Set();
  const result = [];

  for (const array of arrays) {
    for (const element of array) {
      const key = getKey(element);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(element);
      }
    }
  }

  return result;
}
