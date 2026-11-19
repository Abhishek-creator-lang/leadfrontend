function decode(text) {
  const spaced = text.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(spaced);
  } catch {
    // Malformed percent-encoding: keep the text rather than throwing.
    return spaced;
  }
}

function addValue(target, key, value) {
  if (Object.prototype.hasOwnProperty.call(target, key)) {
    const existing = target[key];
    target[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  } else {
    // defineProperty so that "__proto__" becomes an ordinary own property.
    Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
  }
}

/**
 * @param {string} query
 * @return {Record<string, string | string[]>}
 */
export default function parse(query) {
  const result = {};
  const body = query.startsWith('?') ? query.slice(1) : query;

  for (const segment of body.split('&')) {
    if (segment === '') continue;
    // Split at the first '=' only, and decode each half after splitting.
    const eq = segment.indexOf('=');
    const rawKey = eq === -1 ? segment : segment.slice(0, eq);
    const rawValue = eq === -1 ? '' : segment.slice(eq + 1);
    addValue(result, decode(rawKey), decode(rawValue));
  }

  return result;
}

/**
 * @param {Record<string, any>} params
 * @return {string}
 */
export function stringify(params) {
  const pairs = [];
  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item === undefined || item === null) continue;
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
    }
  }
  return pairs.join('&');
}
