import countPaths from './index';

describe('countPaths', () => {
  test('n = 0 has one (empty) path', () => {
    expect(countPaths(0)).toBe(1);
  });

  test('n = 1 and n = 2', () => {
    expect(countPaths(1)).toBe(1);
    expect(countPaths(2)).toBe(2);
  });

  test('small values', () => {
    expect(countPaths(3)).toBe(3);
    expect(countPaths(4)).toBe(5);
    expect(countPaths(5)).toBe(8);
  });

  test('n = 10', () => {
    expect(countPaths(10)).toBe(89);
  });

  test('each value is the sum of the previous two', () => {
    for (let n = 2; n <= 30; n++) {
      expect(countPaths(n)).toBe(countPaths(n - 1) + countPaths(n - 2));
    }
  });

  test('n = 40 and n = 50 (rules out plain recursion)', () => {
    expect(countPaths(40)).toBe(165580141);
    expect(countPaths(50)).toBe(20365011074);
  });

  test('n = 70 is exact', () => {
    expect(countPaths(70)).toBe(308061521170129);
  });
});
