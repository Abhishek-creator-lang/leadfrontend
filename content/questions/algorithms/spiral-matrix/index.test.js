import spiralOrder from './index';

describe('spiralOrder', () => {
  test('3 x 4', () => {
    expect(
      spiralOrder([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ])
    ).toEqual([1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]);
  });

  test('single column', () => {
    expect(spiralOrder([[1], [2], [3]])).toEqual([1, 2, 3]);
  });

  test('single row', () => {
    expect(spiralOrder([[1, 2, 3]])).toEqual([1, 2, 3]);
  });

  test('empty grids', () => {
    expect(spiralOrder([])).toEqual([]);
    expect(spiralOrder([[]])).toEqual([]);
  });

  test('1 x 1 and 2 x 2', () => {
    expect(spiralOrder([[7]])).toEqual([7]);
    expect(
      spiralOrder([
        [1, 2],
        [3, 4],
      ])
    ).toEqual([1, 2, 4, 3]);
  });

  test('3 x 3 has a centre cell', () => {
    expect(
      spiralOrder([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    ).toEqual([1, 2, 3, 6, 9, 8, 7, 4, 5]);
  });

  test('tall rectangle with a single-column core', () => {
    expect(
      spiralOrder([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
        [13, 14, 15],
      ])
    ).toEqual([1, 2, 3, 6, 9, 12, 15, 14, 13, 10, 7, 4, 5, 8, 11]);
  });

  test('does not mutate the grid', () => {
    const grid = [
      [1, 2],
      [3, 4],
    ];
    spiralOrder(grid);
    expect(grid).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('large grid visits every cell exactly once', () => {
    const rows = 700;
    const cols = 900;
    const grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => r * cols + c));
    const out = spiralOrder(grid);
    expect(out).toHaveLength(rows * cols);
    expect(new Set(out).size).toBe(rows * cols);
    expect(out.slice(0, 3)).toEqual([0, 1, 2]);
    expect(out[cols]).toBe(2 * cols - 1);
  });
});
