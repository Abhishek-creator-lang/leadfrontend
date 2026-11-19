/**
 * Turns 'a[0].b' / 'a.0.b' into ['a', '0', 'b'].
 * @param {string|Array<string|number>} path
 * @return {Array<string|number>}
 */
export function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path)
    .replace(/\[([^\]]*)\]/g, '.$1')
    .split('.')
    .filter((key) => key !== '');
}

/**
 * @param {Object} object
 * @param {string|Array<string|number>} path
 * @param {*} [defaultValue]
 * @return {*}
 */
export default function get(object, path, defaultValue) {
  const keys = toPath(path);
  if (keys.length === 0) return defaultValue;

  let current = object;
  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue;
    current = current[key];
  }
  return current === undefined ? defaultValue : current;
}
