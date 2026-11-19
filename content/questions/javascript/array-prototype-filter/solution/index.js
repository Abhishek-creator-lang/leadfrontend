function toLength(value) {
  const n = Math.trunc(Number(value)) || 0;
  return Math.min(Math.max(n, 0), Number.MAX_SAFE_INTEGER);
}

/**
 * Returns a new array with the elements for which `callbackFn` returns truthy.
 *
 * @param {(value: *, index: number, array: Array) => *} callbackFn
 * @param {*} [thisArg]
 * @return {Array}
 */
export default function myFilter(callbackFn, thisArg) {
  if (this == null) {
    throw new TypeError('Array.prototype.myFilter called on null or undefined');
  }
  const O = Object(this);
  const length = toLength(O.length);
  if (typeof callbackFn !== 'function') {
    throw new TypeError(`${String(callbackFn)} is not a function`);
  }

  const result = [];
  for (let k = 0; k < length; k++) {
    if (!(k in O)) continue; // hole, or deleted during iteration
    const value = O[k];
    if (callbackFn.call(thisArg, value, k, O)) {
      result.push(value);
    }
  }
  return result;
}

Array.prototype.myFilter = myFilter;
