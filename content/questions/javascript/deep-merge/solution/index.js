function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// Copies plain objects and arrays so the result never shares them with an input.
function cloneData(value) {
  if (Array.isArray(value)) return value.map(cloneData);
  if (isPlainObject(value)) return mergeInto({}, value);
  return value;
}

// Merges `source` into `target` (a fresh object we own) and returns it.
function mergeInto(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__') continue;
    const incoming = source[key];
    if (incoming === undefined) continue;

    const current = target[key];
    if (isPlainObject(current) && isPlainObject(incoming)) {
      // `current` is already a copy we created, so it's safe to merge into it.
      target[key] = mergeInto(current, incoming);
    } else {
      target[key] = cloneData(incoming);
    }
  }
  return target;
}

/**
 * @param {...Object} objects
 * @return {Object}
 */
export default function deepMerge(...objects) {
  const result = {};
  for (const obj of objects) {
    if (obj === null || obj === undefined) continue;
    mergeInto(result, obj);
  }
  return result;
}
