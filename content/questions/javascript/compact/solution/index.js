/**
 * Returns a new array with all falsy values removed.
 *
 * @param {Array<unknown>} array
 * @return {Array<unknown>}
 */
export default function compact(array) {
  const result = [];
  for (const value of array) {
    if (value) result.push(value);
  }
  return result;
}
