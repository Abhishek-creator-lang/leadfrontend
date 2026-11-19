/**
 * Returns the values of `array` that are not in any of `others`.
 *
 * @template T
 * @param {Array<T>} array
 * @param {...Array<unknown>} others
 * @return {Array<T>}
 */
export default function difference(array, ...others) {
  const excluded = new Set();
  for (const values of others) {
    for (const value of values) excluded.add(value);
  }
  return array.filter((value) => !excluded.has(value));
}
