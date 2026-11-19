import rotateClockwise from './index';

describe('rotateClockwise', () => {
  test('3 x 3', () => {
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(rotateClockwise(grid)).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });

  test('rotates in place, keeping the same array references', () => {
    const grid = [
      [1, 2],
      [3, 4],
    ];
    const rows = grid.slice();
    const result = rotateClockwise(grid);
    expect(result).toBe(grid);
    expect(new Set(grid)).toEqual(new Set(rows));
    expect(grid).toEqual([
      [3, 1],
      [4, 2],
    ]);
  });

  test('empty and 1 x 1', () => {
    expect(rotateClockwise([])).toEqual([]);
    expect(rotateClockwise([['x']])).toEqual([['x']]);
  });

  test('4 x 4 (even size)', () => {
    const grid = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ];
    expect(rotateClockwise(grid)).toEqual([
      [13, 9, 5, 1],
      [14, 10, 6, 2],
      [15, 11, 7, 3],
      [16, 12, 8, 4],
    ]);
  });

  test('four rotations restore the original', () => {
    const original = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
    ];
    const grid = original.map((row) => row.slice());
    for (let i = 0; i < 4; i++) rotateClockwise(grid);
    expect(grid).toEqual(original);
  });

  test('cells can be objects', () => {
    const a = { id: 'a' };
    const b = { id: 'b' };
    const c = { id: 'c' };
    const d = { id: 'd' };
    const grid = [
      [a, b],
      [c, d],
    ];
    rotateClockwise(grid);
    expect(grid[0][0]).toBe(c);
    expect(grid[0][1]).toBe(a);
    expect(grid[1][1]).toBe(b);
  });

  test('large grid', () => {
    const n = 1000;
    const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));
    rotateClockwise(grid);
    // new[c][n-1-r] = old[r][c]
    expect(grid[0][n - 1]).toBe(0);
    expect(grid[0][0]).toBe((n - 1) * n);
    expect(grid[n - 1][0]).toBe(n * n - 1);
    expect(grid[123][n - 1 - 456]).toBe(456 * n + 123);
  });
});
