function toIntegerOrInfinity(value) {
  const number = Number(value);
  if (Number.isNaN(number) || number === 0) return 0;
  if (!Number.isFinite(number)) return number;
  return Math.trunc(number);
}

function toLength(value) {
  return Math.min(Math.max(toIntegerOrInfinity(value), 0), Number.MAX_SAFE_INTEGER);
}

function flattenInto(target, source, depth) {
  const length = toLength(source.length);
  for (let k = 0; k < length; k++) {
    if (!(k in source)) continue; // holes are dropped
    const element = source[k];
    if (depth > 0 && Array.isArray(element)) {
      flattenInto(target, element, depth - 1);
    } else {
      target.push(element);
    }
  }
  return target;
}

/**
 * Returns a new array with sub-arrays flattened up to `depth` levels.
 *
 * @param {number} [depth=1]
 * @return {Array}
 */
export default function myFlat(depth) {
  if (this == null) {
    throw new TypeError('Array.prototype.myFlat called on null or undefined');
  }
  const depthNum = depth === undefined ? 1 : toIntegerOrInfinity(depth);
  return flattenInto([], Object(this), depthNum);
}

Array.prototype.myFlat = myFlat;
