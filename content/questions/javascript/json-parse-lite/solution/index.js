const ESCAPES = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const HEX4 = /^[0-9a-fA-F]{4}$/;

/**
 * Behaves like JSON.parse(text) without a reviver.
 *
 * @param {string} text
 * @return {any}
 */
export default function jsonParse(text) {
  const src = String(text);
  let i = 0;

  function fail(message) {
    throw new SyntaxError(`${message} at position ${i}`);
  }

  function skipWhitespace() {
    while (i < src.length) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') i++;
      else break;
    }
  }

  function expect(char) {
    if (src[i] !== char) fail(i >= src.length ? 'Unexpected end of input' : `Expected '${char}'`);
    i++;
  }

  function parseLiteral(word, value) {
    if (src.startsWith(word, i)) {
      i += word.length;
      return value;
    }
    return fail('Unexpected token');
  }

  function parseNumber() {
    NUMBER.lastIndex = i;
    const match = NUMBER.exec(src);
    if (!match || match[0] === '' || match[0] === '-') fail('Invalid number');
    i += match[0].length;
    return Number(match[0]);
  }

  function parseString() {
    expect('"');
    let out = '';
    let runStart = i;

    while (true) {
      if (i >= src.length) fail('Unterminated string');
      const c = src[i];

      if (c === '"') {
        out += src.slice(runStart, i);
        i++;
        return out;
      }

      if (c === '\\') {
        out += src.slice(runStart, i);
        const next = src[i + 1];
        if (next === 'u') {
          const hex = src.slice(i + 2, i + 6);
          if (!HEX4.test(hex)) fail('Invalid unicode escape');
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
        } else if (next !== undefined && Object.prototype.hasOwnProperty.call(ESCAPES, next)) {
          out += ESCAPES[next];
          i += 2;
        } else {
          fail('Invalid escape');
        }
        runStart = i;
        continue;
      }

      if (c.charCodeAt(0) < 0x20) fail('Bad control character in string');
      i++;
    }
  }

  function parseArray() {
    expect('[');
    const result = [];
    skipWhitespace();
    if (src[i] === ']') {
      i++;
      return result;
    }
    while (true) {
      skipWhitespace();
      result.push(parseValue());
      skipWhitespace();
      if (src[i] === ',') {
        i++;
        continue;
      }
      expect(']');
      return result;
    }
  }

  function parseObject() {
    expect('{');
    const result = {};
    skipWhitespace();
    if (src[i] === '}') {
      i++;
      return result;
    }
    while (true) {
      skipWhitespace();
      if (src[i] !== '"') fail('Expected string key');
      const key = parseString();
      skipWhitespace();
      expect(':');
      skipWhitespace();
      const value = parseValue();
      // defineProperty so a "__proto__" key becomes an own property.
      Object.defineProperty(result, key, { value, writable: true, enumerable: true, configurable: true });
      skipWhitespace();
      if (src[i] === ',') {
        i++;
        continue;
      }
      expect('}');
      return result;
    }
  }

  function parseValue() {
    const c = src[i];
    if (c === '{') return parseObject();
    if (c === '[') return parseArray();
    if (c === '"') return parseString();
    if (c === 't') return parseLiteral('true', true);
    if (c === 'f') return parseLiteral('false', false);
    if (c === 'n') return parseLiteral('null', null);
    if (c === '-' || (c >= '0' && c <= '9')) return parseNumber();
    return fail(c === undefined ? 'Unexpected end of input' : `Unexpected token ${c}`);
  }

  skipWhitespace();
  const value = parseValue();
  skipWhitespace();
  if (i !== src.length) fail('Unexpected trailing input');
  return value;
}
