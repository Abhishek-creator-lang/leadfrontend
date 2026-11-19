/**
 * Checks whether `number` is in [start, end). With two arguments the range is [0, start).
 *
 * @param {number} number
 * @param {number} start
 * @param {number} [end]
 * @return {boolean}
 */
export default function inRange(number, start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (start > end) {
    [start, end] = [end, start];
  }
  return number >= start && number < end;
}
