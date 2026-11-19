/**
 * Creates an array of numbers from `start` up to, but not including, `end`.
 * With one argument, the range is [0, start).
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 * @return {Array<number>}
 */
export default function range(start, end, step) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (step === undefined) {
    step = end < start ? -1 : 1;
  }

  const length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
  const result = new Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = start + i * step;
  }
  return result;
}
