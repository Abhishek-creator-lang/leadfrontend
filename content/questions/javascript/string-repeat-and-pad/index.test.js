import repeat, { padStart, padEnd } from './index';

function withoutBuiltins(fn) {
  const saved = {
    repeat: String.prototype.repeat,
    padStart: String.prototype.padStart,
    padEnd: String.prototype.padEnd,
  };
  for (const name of Object.keys(saved)) {
    String.prototype[name] = function () {
      throw new Error(`String.prototype.${name} is not allowed`);
    };
  }
  try {
    return fn();
  } finally {
    Object.assign(String.prototype, saved);
  }
}

describe('repeat', () => {
  test('repeats a string', () => {
    expect(repeat('ab', 3)).toBe('ababab');
    expect(repeat('x', 5)).toBe('xxxxx');
  });

  test('zero count and empty string', () => {
    expect(repeat('x', 0)).toBe('');
    expect(repeat('', 4)).toBe('');
  });

  test('truncates non-integer counts', () => {
    expect(repeat('a', 2.9)).toBe('aa');
  });

  test('throws RangeError for negative or infinite counts', () => {
    expect(() => repeat('a', -1)).toThrow(RangeError);
    expect(() => repeat('a', Infinity)).toThrow(RangeError);
  });

  test('handles larger counts correctly', () => {
    const result = repeat('ab', 1000);
    expect(result).toHaveLength(2000);
    expect(result.startsWith('abab')).toBe(true);
    expect(result.endsWith('abab')).toBe(true);
  });
});

describe('padStart', () => {
  test('pads with a single character', () => {
    expect(padStart('5', 3, '0')).toBe('005');
  });

  test('cuts the filler to fit, keeping its start', () => {
    expect(padStart('abc', 10, '123')).toBe('1231231abc');
  });

  test('defaults to spaces', () => {
    expect(padStart('abc', 6)).toBe('   abc');
  });

  test('returns the string when already long enough', () => {
    expect(padStart('abcdef', 3, '*')).toBe('abcdef');
    expect(padStart('abc', 3, '*')).toBe('abc');
  });

  test('empty filler returns the string unchanged', () => {
    expect(padStart('abc', 6, '')).toBe('abc');
  });
});

describe('padEnd', () => {
  test('pads the end', () => {
    expect(padEnd('7', 4, '-')).toBe('7---');
    expect(padEnd('abc', 8, 'xy')).toBe('abcxyxyx');
  });

  test('defaults to spaces and handles short targets', () => {
    expect(padEnd('ab', 4)).toBe('ab  ');
    expect(padEnd('abcd', 2, 'z')).toBe('abcd');
  });

  test('empty filler returns the string unchanged', () => {
    expect(padEnd('abc', 6, '')).toBe('abc');
  });
});

describe('no built-ins', () => {
  test('works without String.prototype.repeat/padStart/padEnd', () => {
    const results = withoutBuiltins(() => [
      repeat('ab', 2),
      padStart('1', 3, '0'),
      padEnd('1', 3, '0'),
    ]);
    expect(results).toEqual(['abab', '001', '100']);
  });
});
