function isArguments(value) {
  return Object.prototype.toString.call(value) === '[object Arguments]';
}

function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

/**
 * Checks whether `value` is empty (see the rules in the prompt).
 *
 * @param {unknown} value
 * @return {boolean}
 */
export default function isEmpty(value) {
  if (value == null) return true;

  if (typeof value === 'string') return value.length === 0;

  if (Array.isArray(value) || isTypedArray(value) || isArguments(value)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) return value.size === 0;

  if (typeof value === 'object' || typeof value === 'function') {
    for (const key in value) {
      if (Object.hasOwn(value, key)) return false;
    }
    return true;
  }

  // numbers, booleans, symbols, bigints
  return true;
}
