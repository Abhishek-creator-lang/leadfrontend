import insertInterval from './index';

describe('insertInterval', () => {
  test('merges a slot spanning several blocks', () => {
    expect(
      insertInterval(
        [
          [0, 30],
          [60, 90],
          [120, 150],
          [200, 210],
        ],
        [80, 130]
      )
    ).toEqual([
      [0, 30],
      [60, 150],
      [200, 210],
    ]);
  });

  test('inserts into a gap without merging', () => {
    expect(
      insertInterval(
        [
          [0, 30],
          [60, 90],
        ],
        [40, 50]
      )
    ).toEqual([
      [0, 30],
      [40, 50],
      [60, 90],
    ]);
  });

  test('touching blocks merge on either side', () => {
    expect(insertInterval([[0, 30]], [30, 45])).toEqual([[0, 45]]);
    expect(insertInterval([[50, 60]], [40, 50])).toEqual([[40, 60]]);
  });

  test('empty list', () => {
    expect(insertInterval([], [5, 10])).toEqual([[5, 10]]);
  });

  test('slot before all and after all blocks', () => {
    expect(insertInterval([[10, 20]], [0, 5])).toEqual([
      [0, 5],
      [10, 20],
    ]);
    expect(insertInterval([[10, 20]], [25, 30])).toEqual([
      [10, 20],
      [25, 30],
    ]);
  });

  test('slot inside an existing block', () => {
    expect(insertInterval([[0, 100]], [20, 30])).toEqual([[0, 100]]);
  });

  test('slot swallowing every block', () => {
    expect(
      insertInterval(
        [
          [5, 6],
          [8, 9],
          [11, 12],
        ],
        [0, 50]
      )
    ).toEqual([[0, 50]]);
  });

  test('does not mutate inputs', () => {
    const blocks = [
      [0, 10],
      [20, 30],
    ];
    const slot = [5, 25];
    const result = insertInterval(blocks, slot);
    expect(blocks).toEqual([
      [0, 10],
      [20, 30],
    ]);
    expect(slot).toEqual([5, 25]);
    expect(result).toEqual([[0, 30]]);
    result[0][0] = -1;
    expect(blocks[0][0]).toBe(0);
  });

  test('large input', () => {
    const blocks = Array.from({ length: 100000 }, (_, i) => [i * 10, i * 10 + 5]);
    const result = insertInterval(blocks, [500002, 600003]);
    // Blocks 0..49999 untouched; 50000..60000 merged; 60001.. untouched.
    expect(result).toHaveLength(50000 + 1 + (100000 - 60001));
    expect(result[50000]).toEqual([500000, 600005]);
    expect(result[50001]).toEqual([600010, 600015]);
  });
});
