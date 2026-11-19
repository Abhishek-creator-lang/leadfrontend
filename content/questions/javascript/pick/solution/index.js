/**
 * @param {Object} object
 * @param {Array<string>} keys
 * @return {Object}
 */
export default function pick(object, keys) {
  const result = {};
  if (object === null || object === undefined) return result;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}
