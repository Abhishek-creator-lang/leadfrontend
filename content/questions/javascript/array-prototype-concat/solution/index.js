function isConcatSpreadable(value) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return false;
  }
  const flag = value[Symbol.isConcatSpreadable];
  if (flag !== undefined) return Boolean(flag);
  return Array.isArray(value);
}

function toLength(value) {
  const n = Math.trunc(Number(value)) || 0;
  return Math.min(Math.max(n, 0), Number.MAX_SAFE_INTEGER);
}

/**
 * Returns a new array: `this` followed by each item. Concat-spreadable items
 * (arrays, or objects with a truthy Symbol.isConcatSpreadable) are spread one level.
 *
 * @param {...*} items
 * @return {Array}
 */
export default function myConcat(...items) {
  if (this == null) {
    throw new TypeError('Array.prototype.myConcat called on null or undefined');
  }
  const sources = [Object(this), ...items];
  const result = [];
  let n = 0;

  for (const source of sources) {
    if (isConcatSpreadable(source)) {
      const length = toLength(source.length);
      for (let k = 0; k < length; k++, n++) {
        // Skip holes but still advance the cursor so the gap is preserved.
        if (k in source) result[n] = source[k];
      }
    } else {
      result[n] = source;
      n++;
    }
  }

  // Trailing holes never write anything, so set the length explicitly.
  result.length = n;
  return result;
}

Array.prototype.myConcat = myConcat;
