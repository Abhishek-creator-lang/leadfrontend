function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function toCamel(key) {
  // A run of underscores with a non-underscore character on both sides.
  return key.replace(/(?<=[^_])_+([^_])/g, (_, ch) => ch.toUpperCase());
}

/**
 * @param {any} value
 * @return {any} A new value with every plain-object key converted to camelCase.
 */
export default function camelCaseKeys(value) {
  if (Array.isArray(value)) return value.map(camelCaseKeys);
  if (!isPlainObject(value)) return value;

  const out = {};
  for (const [key, child] of Object.entries(value)) {
    out[toCamel(key)] = camelCaseKeys(child);
  }
  return out;
}
