function collect(value, out) {
  if (!value) return; // null, undefined, false, '', 0, NaN

  const type = typeof value;
  if (type === 'string' || type === 'number') {
    out.push(String(value));
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item, out);
  } else if (type === 'object') {
    for (const key of Object.keys(value)) {
      if (value[key]) out.push(key);
    }
  }
  // true, functions, symbols and bigints are ignored.
}

/**
 * @param {...any} args Strings, numbers, arrays (nested) and objects of { className: condition }.
 * @return {string}
 */
export default function classNames(...args) {
  const out = [];
  collect(args, out);
  return out.join(' ');
}
