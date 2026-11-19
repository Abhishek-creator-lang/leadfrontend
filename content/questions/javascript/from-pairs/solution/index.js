/**
 * Creates an object from an array of [key, value] pairs.
 *
 * @param {Array<[PropertyKey, unknown]>} pairs
 * @return {Record<PropertyKey, unknown>}
 */
export default function fromPairs(pairs) {
  const result = {};
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}
