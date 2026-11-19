function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * @param {*} value
 * @param {Array<string>} keys
 * @return {*}
 */
export default function deepOmit(value, keys) {
  const excluded = new Set(keys);

  function walk(node) {
    if (Array.isArray(node)) {
      return node.map(walk);
    }
    if (isPlainObject(node)) {
      const result = {};
      for (const key of Object.keys(node)) {
        if (!excluded.has(key)) {
          result[key] = walk(node[key]);
        }
      }
      return result;
    }
    return node;
  }

  return walk(value);
}
