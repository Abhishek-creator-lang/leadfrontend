function isArrayLikeCollection(value) {
  return (
    Array.isArray(value) ||
    (ArrayBuffer.isView(value) && !(value instanceof DataView)) ||
    Object.prototype.toString.call(value) === '[object Arguments]'
  );
}

/**
 * Returns the number of items in `collection` (see the rules in the prompt).
 *
 * @param {unknown} collection
 * @return {number}
 */
export default function size(collection) {
  if (collection == null) return 0;

  if (typeof collection === 'string') {
    let count = 0;
    // The string iterator yields whole code points, so surrogate pairs count once.
    for (const _ of collection) count++;
    return count;
  }

  if (isArrayLikeCollection(collection)) return collection.length;

  if (collection instanceof Map || collection instanceof Set) return collection.size;

  if (typeof collection === 'object' || typeof collection === 'function') {
    return Object.keys(collection).length;
  }

  return 0;
}
