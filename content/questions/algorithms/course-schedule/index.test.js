import canFinishAll from './index';

describe('canFinishAll', () => {
  test('simple chain', () => {
    expect(
      canFinishAll(3, [
        [1, 0],
        [2, 1],
      ])
    ).toBe(true);
  });

  test('two lessons requiring each other', () => {
    expect(
      canFinishAll(2, [
        [0, 1],
        [1, 0],
      ])
    ).toBe(false);
  });

  test('diamond is fine', () => {
    expect(
      canFinishAll(4, [
        [1, 0],
        [2, 0],
        [3, 1],
        [3, 2],
      ])
    ).toBe(true);
  });

  test('self-prerequisite', () => {
    expect(canFinishAll(1, [[0, 0]])).toBe(false);
  });

  test('no prerequisites', () => {
    expect(canFinishAll(5, [])).toBe(true);
  });

  test('cycle in one component, others fine', () => {
    expect(
      canFinishAll(6, [
        [1, 0],
        [3, 2],
        [4, 3],
        [2, 4],
        [5, 0],
      ])
    ).toBe(false);
  });

  test('duplicate pairs', () => {
    expect(
      canFinishAll(2, [
        [1, 0],
        [1, 0],
      ])
    ).toBe(true);
  });

  test('stacked diamonds (exponentially many paths)', () => {
    // 60 layers of 2 lessons; each lesson requires both lessons of the previous layer.
    const pairs = [];
    const layers = 60;
    for (let l = 1; l < layers; l++) {
      for (const a of [0, 1]) for (const b of [0, 1]) pairs.push([2 * l + a, 2 * (l - 1) + b]);
    }
    expect(canFinishAll(2 * layers, pairs)).toBe(true);
    pairs.push([0, 2 * layers - 1]); // close a loop from the top back to the bottom
    expect(canFinishAll(2 * layers, pairs)).toBe(false);
  });

  test('large chain', () => {
    const n = 5000;
    const pairs = [];
    for (let i = 1; i < n; i++) pairs.push([i, i - 1]);
    expect(canFinishAll(n, pairs)).toBe(true);
    pairs.push([0, n - 1]);
    expect(canFinishAll(n, pairs)).toBe(false);
  });
});
