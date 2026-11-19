import parse, { stringify } from './index';

describe('parse', () => {
  test('parses simple pairs and ignores a leading ?', () => {
    expect(parse('?a=1&b=two')).toEqual({ a: '1', b: 'two' });
    expect(parse('a=1&b=two')).toEqual({ a: '1', b: 'two' });
  });

  test('empty input gives an empty object', () => {
    expect(parse('')).toEqual({});
    expect(parse('?')).toEqual({});
    expect(parse('&&&')).toEqual({});
  });

  test('keys without = get an empty string', () => {
    expect(parse('debug&verbose=&x=1')).toEqual({ debug: '', verbose: '', x: '1' });
  });

  test('splits only at the first =', () => {
    expect(parse('token=abc==&eq=a=b')).toEqual({ token: 'abc==', eq: 'a=b' });
  });

  test('repeated keys become arrays in order', () => {
    expect(parse('tag=js&tag=ui&tag=css&one=1')).toEqual({ tag: ['js', 'ui', 'css'], one: '1' });
  });

  test('decodes + as space and percent-escapes', () => {
    expect(parse('q=react+hooks&city=S%C3%A3o%20Paulo&plus=1%2B1')).toEqual({
      q: 'react hooks',
      city: 'São Paulo',
      plus: '1+1',
    });
  });

  test('encoded delimiters inside values are preserved', () => {
    expect(parse('q=a%26b%3Dc&next=%2Fhome%3Fx%3D1')).toEqual({ q: 'a&b=c', next: '/home?x=1' });
  });

  test('decodes keys too', () => {
    expect(parse('first%20name=Ada')).toEqual({ 'first name': 'Ada' });
  });

  test('does not throw on malformed percent-encoding', () => {
    expect(parse('a=100%&b=%E0%A4%A&c=ok')).toEqual({ a: '100%', b: '%E0%A4%A', c: 'ok' });
  });

  test('a __proto__ key is stored as an own property', () => {
    const result = parse('__proto__=x&toString=y');
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(true);
    expect(result.toString).toBe('y');
  });
});

describe('stringify', () => {
  test('serialises keys in order with encodeURIComponent', () => {
    expect(stringify({ q: 'react hooks', page: 2, ok: true })).toBe('q=react%20hooks&page=2&ok=true');
  });

  test('repeats keys for arrays and skips null/undefined', () => {
    expect(stringify({ tag: ['js', null, 'ui'], none: [], a: undefined, b: null, c: '' })).toBe('tag=js&tag=ui&c=');
  });

  test('encodes reserved characters in keys and values', () => {
    expect(stringify({ 'a&b': 'x=y&z', path: '/p?q#h', plus: '1+1' })).toBe(
      'a%26b=x%3Dy%26z&path=%2Fp%3Fq%23h&plus=1%2B1'
    );
  });

  test('empty object gives an empty string', () => {
    expect(stringify({})).toBe('');
  });

  test('round-trips through parse', () => {
    const params = { q: 'café & crème = 100%', tags: ['a b', 'c+d', '😀'], empty: '' };
    expect(parse(stringify(params))).toEqual(params);
    expect(parse(`?${stringify(params)}`)).toEqual(params);
  });

  test('parse matches URLSearchParams for well-formed input', () => {
    const query = 'a=1&b=hello+world&c=%26&d';
    const native = Object.fromEntries(new URLSearchParams(query));
    expect(parse(query)).toEqual(native);
  });
});
