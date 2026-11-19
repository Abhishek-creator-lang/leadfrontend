/**
 * Returns the element with the smallest `iteratee` value.
 *
 * @template T
 * @param {Array<T>} array
 * @param {((value: T) => unknown) | string} iteratee
 * @return {T | undefined}
 */
export default function minBy(array, iteratee) {
  const getValue = typeof iteratee === 'function' ? iteratee : (element) => element[iteratee];
  let best;
  let bestValue;
  let found = false;

  for (const element of array) {
    const value = getValue(element);
    if (value == null || Number.isNaN(value)) continue;
    if (!found || value < bestValue) {
      best = element;
      bestValue = value;
      found = true;
    }
  }

  return best;
}
