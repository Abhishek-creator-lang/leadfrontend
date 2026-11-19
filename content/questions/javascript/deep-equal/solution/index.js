function isObject(value) {
  return value !== null && typeof value === 'object';
}

/**
 * @param {*} a
 * @param {*} b
 * @return {boolean}
 */
export default function deepEqual(a, b) {
  // Fast path for identical references and equal primitives.
  if (a === b) return true;

  if (!isObject(a) || !isObject(b)) {
    // SameValueZero: the only primitive that isn't === to itself is NaN.
    return a !== a && b !== b;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}
