function normalise(index, length) {
  if (index < 0) return Math.max(length + index, 0);
  return Math.min(index, length);
}

/**
 * Fills `array` with `value` from `start` up to, but not including, `end`.
 * Mutates and returns `array`.
 *
 * @template T
 * @param {Array<unknown>} array
 * @param {T} value
 * @param {number} [start=0]
 * @param {number} [end=array.length]
 * @return {Array<unknown>}
 */
export default function fill(array, value, start = 0, end = array.length) {
  const length = array.length;
  const from = normalise(start, length);
  const to = normalise(end, length);

  for (let i = from; i < to; i++) {
    array[i] = value;
  }
  return array;
}
