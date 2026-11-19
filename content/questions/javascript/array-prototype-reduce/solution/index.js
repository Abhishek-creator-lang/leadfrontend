function toLength(value) {
  const n = Math.trunc(Number(value)) || 0;
  return Math.min(Math.max(n, 0), Number.MAX_SAFE_INTEGER);
}

/**
 * Reduces the array to a single value, from left to right.
 *
 * @param {(accumulator: *, value: *, index: number, array: Array) => *} callbackFn
 * @param {*} [initialValue]
 * @return {*}
 */
export default function myReduce(callbackFn, initialValue) {
  if (this == null) {
    throw new TypeError('Array.prototype.myReduce called on null or undefined');
  }
  const O = Object(this);
  const length = toLength(O.length);
  if (typeof callbackFn !== 'function') {
    throw new TypeError(`${String(callbackFn)} is not a function`);
  }

  let k = 0;
  let accumulator;

  // An explicitly passed `undefined` still counts as an initial value.
  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    // Use the first element that actually exists (skip leading holes).
    while (k < length && !(k in O)) k++;
    if (k >= length) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = O[k];
    k++;
  }

  for (; k < length; k++) {
    if (k in O) {
      accumulator = callbackFn(accumulator, O[k], k, O);
    }
  }
  return accumulator;
}

Array.prototype.myReduce = myReduce;
