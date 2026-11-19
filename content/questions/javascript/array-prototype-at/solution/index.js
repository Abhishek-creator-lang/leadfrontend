function toIntegerOrInfinity(value) {
  const number = Number(value);
  if (Number.isNaN(number) || number === 0) return 0;
  if (!Number.isFinite(number)) return number;
  return Math.trunc(number);
}

function toLength(value) {
  const length = toIntegerOrInfinity(value);
  return Math.min(Math.max(length, 0), Number.MAX_SAFE_INTEGER);
}

/**
 * Returns the element at `index`. Negative indices count back from the end.
 * Called as `array.myAt(index)`, so the array is `this`.
 *
 * @param {number} index
 * @return {*}
 */
export default function myAt(index) {
  if (this == null) {
    throw new TypeError('Array.prototype.myAt called on null or undefined');
  }
  const O = Object(this);
  const length = toLength(O.length);
  const relative = toIntegerOrInfinity(index);
  const k = relative >= 0 ? relative : length + relative;

  if (k < 0 || k >= length) return undefined;
  return O[k];
}

Array.prototype.myAt = myAt;
