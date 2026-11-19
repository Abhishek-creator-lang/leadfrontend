/**
 * Returns a duplicate-free copy of `array`, keeping first occurrences in order.
 *
 * @template T
 * @param {Array<T>} array
 * @return {Array<T>}
 */
export default function uniqueArray(array) {
  const seen = new Set();
  const result = [];

  for (const value of array) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
}
