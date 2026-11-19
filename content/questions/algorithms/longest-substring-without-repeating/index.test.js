import longestUniqueRun from './index';

describe('longestUniqueRun', () => {
  test('basic examples', () => {
    expect(longestUniqueRun('abcabd')).toBe(4);
    expect(longestUniqueRun('mississippi')).toBe(3);
  });

  test('all the same character', () => {
    expect(longestUniqueRun('aaaa')).toBe(1);
  });

  test('empty and single character', () => {
    expect(longestUniqueRun('')).toBe(0);
    expect(longestUniqueRun('z')).toBe(1);
  });

  test('case-sensitive and symbols', () => {
    expect(longestUniqueRun('Ab1!aB')).toBe(6);
  });

  test('stale index behind the window is ignored', () => {
    expect(longestUniqueRun('abba')).toBe(2);
    expect(longestUniqueRun('tmmzuxt')).toBe(5);
  });

  test('spaces count as characters', () => {
    expect(longestUniqueRun('a b c')).toBe(3);
  });

  test('all distinct', () => {
    expect(longestUniqueRun('qwertyuiop')).toBe(10);
  });

  test('long input with a large alphabet', () => {
    // 2,000 distinct characters repeated 50 times: the answer is 2,000.
    let alphabet = '';
    for (let i = 0; i < 2000; i++) alphabet += String.fromCharCode(0x4e00 + i);
    const text = alphabet.repeat(50);
    expect(longestUniqueRun(text)).toBe(2000);
    expect(longestUniqueRun(text + text[0])).toBe(2000);
  });
});
