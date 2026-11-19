/**
 * @param {Object} object
 * @param {Array<string>} keys
 * @return {Object}
 */
export default function omit(object, keys) {
  const result = {};
  if (object === null || object === undefined) return result;

  const excluded = new Set(keys.map(String));
  for (const key of Object.keys(object)) {
    if (!excluded.has(key)) {
      result[key] = object[key];
    }
  }
  return result;
}
