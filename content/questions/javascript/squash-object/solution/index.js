function isContainer(value) {
  if (Array.isArray(value)) return true;
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function walk(value, path, out) {
  if (isContainer(value)) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, key === '' ? path : [...path, key], out);
    }
    return;
  }
  out[path.join('.')] = value;
}

/**
 * @param {Object} obj
 * @return {Object} A single-level object keyed by dot-separated paths.
 */
export default function squashObject(obj) {
  const out = {};
  walk(obj, [], out);
  return out;
}
