import countIslands from './index';

describe('countIslands', () => {
  test('basic example', () => {
    expect(
      countIslands([
        [1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1],
      ])
    ).toBe(4);
  });

  test('diagonal cells are separate', () => {
    expect(
      countIslands([
        [1, 0],
        [0, 1],
      ])
    ).toBe(2);
  });

  test('empty grids', () => {
    expect(countIslands([])).toBe(0);
    expect(countIslands([[]])).toBe(0);
    expect(countIslands([[0]])).toBe(0);
  });

  test('all land is one island', () => {
    expect(
      countIslands([
        [1, 1, 1],
        [1, 1, 1],
      ])
    ).toBe(1);
  });

  test('U-shaped island is connected through the bottom', () => {
    expect(
      countIslands([
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
      ])
    ).toBe(1);
  });

  test('single row and single column', () => {
    expect(countIslands([[1, 0, 1, 1, 0, 1]])).toBe(3);
    expect(countIslands([[1], [1], [0], [1]])).toBe(2);
  });

  test('does not mutate the grid', () => {
    const grid = [
      [1, 1],
      [0, 1],
    ];
    countIslands(grid);
    expect(grid).toEqual([
      [1, 1],
      [0, 1],
    ]);
  });

  test('checkerboard has one island per painted cell', () => {
    const n = 200;
    const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => ((r + c) % 2 === 0 ? 1 : 0)));
    expect(countIslands(grid)).toBe((n * n) / 2);
  });

  test('one huge snake-shaped island', () => {
    // 401 x 400 grid: painted rows joined alternately at the right and left ends.
    const rows = 401;
    const cols = 400;
    const grid = Array.from({ length: rows }, (_, r) => {
      if (r % 2 === 0) return new Array(cols).fill(1);
      const row = new Array(cols).fill(0);
      row[r % 4 === 1 ? cols - 1 : 0] = 1;
      return row;
    });
    expect(countIslands(grid)).toBe(1);
  });
});
