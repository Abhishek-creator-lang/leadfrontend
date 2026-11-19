/**
 * Returns the arithmetic mean of `array`, or NaN if it is empty.
 *
 * @param {Array<number>} array
 * @return {number}
 */
export default function mean(array) {
  if (array.length === 0) return NaN;

  let sum = 0;
  for (const n of array) sum += n;
  return sum / array.length;
}
