import minRemovals from './index';

describe('minRemovals', () => {
  test('example with clashes', () => {
    expect(
      minRemovals([
        [0, 60],
        [30, 90],
        [60, 120],
        [0, 120],
      ])
    ).toBe(2);
  });

  test('duplicates', () => {
    expect(
      minRemovals([
        [10, 20],
        [10, 20],
        [10, 20],
      ])
    ).toBe(2);
  });

  test('touching intervals do not clash', () => {
    expect(
      minRemovals([
        [0, 10],
        [10, 20],
        [20, 30],
      ])
    ).toBe(0);
  });

  test('empty and single', () => {
    expect(minRemovals([])).toBe(0);
    expect(minRemovals([[1, 2]])).toBe(0);
  });

  test('a long interval covering short ones is the one removed', () => {
    expect(
      minRemovals([
        [0, 100],
        [10, 20],
        [30, 40],
        [50, 60],
      ])
    ).toBe(1);
  });

  test('shortest-first would be wrong here', () => {
    expect(
      minRemovals([
        [0, 55],
        [50, 60],
        [55, 100],
      ])
    ).toBe(1);
  });

  test('does not mutate the input', () => {
    const input = [
      [5, 9],
      [0, 6],
    ];
    minRemovals(input);
    expect(input).toEqual([
      [5, 9],
      [0, 6],
    ]);
  });

  test('large input', () => {
    // Intervals [i, i+2): each overlaps its neighbours.
    const requests = [];
    for (let i = 0; i < 100000; i++) requests.push([i, i + 2]);
    // Keeping every other interval is optimal: 50,000 kept.
    expect(minRemovals(requests.reverse())).toBe(50000);
  });
});
