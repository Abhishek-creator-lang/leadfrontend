/**
 * Returns the element with the largest `iteratee` value.
 *
 * @template T
 * @param {Array<T>} array
 * @param {(value: T) => unknown} iteratee
 * @return {T | undefined}
 */
export default function maxBy(array, iteratee) {
  let best;
  let bestValue;
  let found = false;

  for (const element of array) {
    const value = iteratee(element);
    if (value == null || Number.isNaN(value)) continue;
    if (!found || value > bestValue) {
      best = element;
      bestValue = value;
      found = true;
    }
  }

  return best;
}
