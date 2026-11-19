/**
 * @param {*} value
 * @return {Promise<any>}
 */
export default function promiseResolve(value) {
  // Native promises (not subclasses) are returned unchanged.
  if (value instanceof Promise && value.constructor === Promise) {
    return value;
  }

  // The executor's `resolve` adopts thenables: it reads `then` once, calls it in a
  // later microtask, honours only the first settlement, and turns throws into rejections.
  return new Promise((resolve) => {
    resolve(value);
  });
}
