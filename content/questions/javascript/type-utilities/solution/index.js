/** @param {any} value @return {boolean} */
export function isBoolean(value) {
  return typeof value === 'boolean';
}

/** @param {any} value @return {boolean} */
export function isNumber(value) {
  return typeof value === 'number';
}

/** @param {any} value @return {boolean} */
export function isString(value) {
  return typeof value === 'string';
}

/** @param {any} value @return {boolean} */
export function isSymbol(value) {
  return typeof value === 'symbol';
}

/** @param {any} value @return {boolean} */
export function isBigInt(value) {
  return typeof value === 'bigint';
}

/** @param {any} value @return {boolean} */
export function isNull(value) {
  return value === null;
}

/** @param {any} value @return {boolean} */
export function isUndefined(value) {
  return value === undefined;
}

/** @param {any} value @return {boolean} true for null or undefined */
export function isNil(value) {
  return value == null;
}

/**
 * @param {any} value
 * @return {boolean} true for any of the seven primitive types
 */
export default function isPrimitive(value) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}
