import partial from './index';

const _ = partial.placeholder;
const greet = (greeting, name, punctuation) => `${greeting}, ${name}${punctuation}`;

describe('partial', () => {
  test('binds leading arguments', () => {
    expect(partial(greet, 'Hello')('Ada', '!')).toBe('Hello, Ada!');
    expect(partial(greet, 'Hello', 'Ada')('.')).toBe('Hello, Ada.');
  });

  test('works with no bound arguments', () => {
    expect(partial(greet)('Hey', 'Bo', '!')).toBe('Hey, Bo!');
  });

  test('placeholders are filled left to right and the rest is appended', () => {
    expect(partial(greet, _, 'Ada')('Hi', '?')).toBe('Hi, Ada?');
    expect(partial(greet, _, _, '!')('Yo', 'Cy')).toBe('Yo, Cy!');
  });

  test('always calls func, even when holes are unfilled', () => {
    const fn = jest.fn((...args) => args);
    expect(partial(fn, _, 2)()).toEqual([undefined, 2]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('extra call arguments are appended', () => {
    const fn = jest.fn((...args) => args);
    expect(partial(fn, 1, _)(2, 3, 4)).toEqual([1, 2, 3, 4]);
  });

  test('is reusable without leaking arguments between calls', () => {
    const p = partial(greet, _, 'Ada');
    expect(p('Hi', '!')).toBe('Hi, Ada!');
    expect(p('Bye', '.')).toBe('Bye, Ada.');
  });

  test('keeps `this` dynamic', () => {
    const obj = {
      prefix: '>>',
      say: partial(function (a, b) {
        return `${this.prefix} ${a} ${b}`;
      }, 'hi'),
    };
    expect(obj.say('there')).toBe('>> hi there');
  });

  test('returns func\'s return value', () => {
    const add = (a, b, c) => a + b + c;
    expect(partial(add, 1, _, 3)(2)).toBe(6);
  });

  test('exposes the placeholder', () => {
    expect(typeof partial.placeholder).toBe('symbol');
  });
});
