function toLength(value) {
  const n = Math.trunc(Number(value)) || 0;
  return Math.min(Math.max(n, 0), Number.MAX_SAFE_INTEGER);
}

/**
 * Returns a new array with `callbackFn` applied to every element.
 *
 * @param {(value: *, index: number, array: Array) => *} callbackFn
 * @param {*} [thisArg]
 * @return {Array}
 */
export default function myMap(callbackFn, thisArg) {
  if (this == null) {
    throw new TypeError('Array.prototype.myMap called on null or undefined');
  }
  const O = Object(this);
  const length = toLength(O.length);
  if (typeof callbackFn !== 'function') {
    throw new TypeError(`${String(callbackFn)} is not a function`);
  }

  // Starts as `length` holes; indices we skip stay holes.
  const result = new Array(length);
  for (let k = 0; k < length; k++) {
    if (k in O) {
      result[k] = callbackFn.call(thisArg, O[k], k, O);
    }
  }
  return result;
}

Array.prototype.myMap = myMap;
