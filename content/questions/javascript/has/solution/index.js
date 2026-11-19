function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path)
    .replace(/\[([^\]]*)\]/g, '.$1')
    .split('.')
    .filter((key) => key !== '');
}

/**
 * @param {Object} object
 * @param {string|Array<string|number>} path
 * @return {boolean}
 */
export default function has(object, path) {
  const keys = toPath(path);
  if (keys.length === 0) return false;

  let current = object;
  for (const key of keys) {
    // Primitives and nullish values have no own properties we care about.
    const isContainer =
      current !== null && (typeof current === 'object' || typeof current === 'function');
    if (!isContainer || !Object.prototype.hasOwnProperty.call(current, key)) {
      return false;
    }
    current = current[key];
  }
  return true;
}
