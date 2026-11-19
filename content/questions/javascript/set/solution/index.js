const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function toPath(path) {
  if (Array.isArray(path)) return path.map(String);
  return String(path)
    .replace(/\[([^\]]*)\]/g, '.$1')
    .split('.')
    .filter((key) => key !== '');
}

// '0', '12' are indexes; '01', '-1', '1.5' are not.
function isIndex(key) {
  return /^(0|[1-9]\d*)$/.test(key);
}

function isObjectLike(value) {
  return value !== null && typeof value === 'object';
}

/**
 * @param {Object} object
 * @param {string|Array<string|number>} path
 * @param {*} value
 * @return {Object} the same object, mutated
 */
export default function set(object, path, value) {
  if (object === null || object === undefined) return object;

  const keys = toPath(path);
  if (keys.length === 0 || keys.some((key) => UNSAFE_KEYS.has(key))) return object;

  let current = object;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!isObjectLike(current[key])) {
      current[key] = isIndex(keys[i + 1]) ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return object;
}
