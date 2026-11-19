import jsonParse from './index';

const same = (text) => expect(jsonParse(text)).toEqual(JSON.parse(text));
const invalid = (text) => expect(() => jsonParse(text)).toThrow(SyntaxError);

describe('jsonParse', () => {
  test('literals', () => {
    expect(jsonParse('true')).toBe(true);
    expect(jsonParse('false')).toBe(false);
    expect(jsonParse('null')).toBe(null);
  });

  test('numbers', () => {
    ['0', '-0', '7', '-12', '3.25', '-0.5', '1e3', '1E+2', '2.5e-3', '123456789012', '-1.5E10'].forEach((t) => {
      expect(Object.is(jsonParse(t), JSON.parse(t))).toBe(true);
    });
  });

  test('strings with every escape', () => {
    same('"plain"');
    same('""');
    same('"quote \\" backslash \\\\ slash \\/"');
    same('"\\b\\f\\n\\r\\t"');
    same('"caf\\u00e9 \\u00E9"');
    same('"pair \\ud83d\\ude00 lone \\ud800"');
    same('"raw unicode é 😀"');
  });

  test('arrays and objects', () => {
    same('[]');
    same('{}');
    same('[1,"a",true,null,[2,[3]],{"k":[]}]');
    same('{"a":1,"b":{"c":[1,2,{"d":"e"}]},"f":null}');
  });

  test('whitespace between tokens', () => {
    same(' \n\t{ "a" : [ 1 , 2 ] ,\r\n "b" : { } } \n');
  });

  test('duplicate keys: last one wins', () => {
    expect(jsonParse('{"a":1,"a":2}')).toEqual({ a: 2 });
  });

  test('converts non-string input with String()', () => {
    expect(jsonParse(42)).toBe(42);
    expect(jsonParse(null)).toBe(null);
  });

  test('"__proto__" becomes an own property, not the prototype', () => {
    const result = jsonParse('{"__proto__":{"polluted":true}}');
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(true);
    expect(result.polluted).toBeUndefined();
    expect({}.polluted).toBeUndefined();
  });

  test('rejects empty input and trailing content', () => {
    ['', '   ', '1 2', '{} x', '[]]', 'nulls', 'tru'].forEach(invalid);
  });

  test('rejects invalid numbers', () => {
    ['01', '+1', '.5', '1.', '-', '1e', '1e+', '0x10', 'NaN', 'Infinity', '-Infinity', '--1'].forEach(invalid);
  });

  test('rejects invalid strings', () => {
    ["'single'", '"unterminated', '"bad \\x escape"', '"\\u12"', '"\\u12G4"', '"raw\nnewline"', '"tab\there"'].forEach(
      invalid
    );
  });

  test('rejects structural errors', () => {
    ['[1,]', '[,1]', '[1 2]', '{"a":1,}', '{a:1}', '{"a" 1}', '{"a":}', '{1:2}', '[', '{"a":1', '}'].forEach(invalid);
  });

  test('round-trips a realistic payload', () => {
    const data = {
      id: 'u_123',
      profile: { name: 'Zoë "Z" O\'Neil', bio: 'Line 1\nLine 2\t✓', age: 29, score: -0.125, verified: false },
      tags: ['a', 'b'],
      history: [{ at: '2024-01-01T00:00:00.000Z', amount: 1.5e2 }],
      deleted: null,
    };
    expect(jsonParse(JSON.stringify(data))).toEqual(data);
    expect(jsonParse(JSON.stringify(data, null, 2))).toEqual(data);
  });
});
