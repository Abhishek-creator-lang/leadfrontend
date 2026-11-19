function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * @param {*} value
 * @param {(leaf: *, path: Array<string|number>) => *} fn
 * @return {*}
 */
export default function deepMap(value, fn) {
  function walk(node, path) {
    if (Array.isArray(node)) {
      return node.map((item, index) => walk(item, [...path, index]));
    }
    if (isPlainObject(node)) {
      const result = {};
      for (const key of Object.keys(node)) {
        result[key] = walk(node[key], [...path, key]);
      }
      return result;
    }
    return fn(node, path);
  }

  return walk(value, []);
}
