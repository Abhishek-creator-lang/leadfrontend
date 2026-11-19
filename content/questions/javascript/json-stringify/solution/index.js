const SHORT_ESCAPES = {
  '"': '\\"',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
};

function unicodeEscape(code) {
  return '\\u' + code.toString(16).padStart(4, '0');
}

function quote(str) {
  let out = '"';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.charCodeAt(i);

    if (SHORT_ESCAPES[char] !== undefined) {
      out += SHORT_ESCAPES[char];
    } else if (code < 0x20) {
      out += unicodeEscape(code);
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // High surrogate: valid only if followed by a low surrogate.
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        out += char + str[i + 1];
        i++;
      } else {
        out += unicodeEscape(code);
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      // Low surrogate without a preceding high surrogate.
      out += unicodeEscape(code);
    } else {
      out += char;
    }
  }
  return out + '"';
}

function unwrapPrimitive(value) {
  switch (Object.prototype.toString.call(value)) {
    case '[object Number]':
      return Number(value);
    case '[object String]':
      return String(value);
    case '[object Boolean]':
      return value.valueOf();
    default:
      return value;
  }
}

/**
 * Returns the JSON text for `value`, or undefined if it has no JSON representation.
 */
function serialize(value, key, stack) {
  if (value !== null && (typeof value === 'object' || typeof value === 'bigint')) {
    if (typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }
  }

  if (value !== null && typeof value === 'object') {
    value = unwrapPrimitive(value);
  }

  if (value === null) return 'null';

  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'string':
      return quote(value);
    case 'number':
      return Number.isFinite(value) ? String(value) : 'null';
    case 'bigint':
      throw new TypeError('Do not know how to serialize a BigInt');
    case 'undefined':
    case 'function':
    case 'symbol':
      return undefined;
    default:
      break;
  }

  // Objects and arrays.
  if (stack.includes(value)) {
    throw new TypeError('Converting circular structure to JSON');
  }
  stack.push(value);

  let result;
  if (Array.isArray(value)) {
    const parts = [];
    for (let i = 0; i < value.length; i++) {
      const item = serialize(value[i], String(i), stack);
      parts.push(item === undefined ? 'null' : item);
    }
    result = `[${parts.join(',')}]`;
  } else {
    const parts = [];
    for (const k of Object.keys(value)) {
      const item = serialize(value[k], k, stack);
      if (item !== undefined) parts.push(`${quote(k)}:${item}`);
    }
    result = `{${parts.join(',')}}`;
  }

  stack.pop();
  return result;
}

/**
 * Behaves like JSON.stringify(value) with no replacer or space argument.
 *
 * @param {any} value
 * @return {string | undefined}
 */
export default function jsonStringify(value) {
  return serialize(value, '', []);
}
