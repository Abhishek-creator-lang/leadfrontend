/** @param {unknown} value @return {boolean} true for real arrays only */
export function isArray(value) {
  return Array.isArray(value);
}

/** @param {unknown} value @return {boolean} true for anything callable */
export function isFunction(value) {
  return typeof value === 'function';
}

/** @param {unknown} value @return {boolean} true for any non-null object or function */
export function isObject(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

/**
 * @param {unknown} value
 * @return {boolean} true if the prototype is Object.prototype or null
 */
export default function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}
