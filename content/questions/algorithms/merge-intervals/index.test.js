import mergeIntervals from './index';

describe('mergeIntervals', () => {
  test('merges overlapping and touching events', () => {
    expect(
      mergeIntervals([
        [540, 600],
        [570, 630],
        [630, 660],
        [780, 840],
      ])
    ).toEqual([
      [540, 660],
      [780, 840],
    ]);
  });

  test('sorts unsorted input', () => {
    expect(
      mergeIntervals([
        [60, 120],
        [0, 30],
      ])
    ).toEqual([
      [0, 30],
      [60, 120],
    ]);
  });

  test('empty and single event', () => {
    expect(mergeIntervals([])).toEqual([]);
    expect(mergeIntervals([[5, 10]])).toEqual([[5, 10]]);
  });

  test('event fully contained in another', () => {
    expect(
      mergeIntervals([
        [0, 100],
        [10, 20],
        [30, 40],
      ])
    ).toEqual([[0, 100]]);
  });

  test('zero-length and duplicate events', () => {
    expect(
      mergeIntervals([
        [50, 50],
        [10, 20],
        [10, 20],
        [20, 20],
      ])
    ).toEqual([
      [10, 20],
      [50, 50],
    ]);
  });

  test('does not mutate the input', () => {
    const input = [
      [30, 60],
      [0, 40],
    ];
    const snapshot = JSON.parse(JSON.stringify(input));
    mergeIntervals(input);
    expect(input).toEqual(snapshot);
  });

  test('chain of overlaps collapses into one block', () => {
    expect(
      mergeIntervals([
        [4, 6],
        [1, 3],
        [2, 5],
        [6, 9],
      ])
    ).toEqual([[1, 9]]);
  });

  test('large input', () => {
    // 100,000 events in pairs: [10i, 10i+5] and [10i+3, 10i+6] -> 50,000 blocks.
    const events = [];
    for (let i = 0; i < 50000; i++) {
      events.push([10 * i, 10 * i + 5], [10 * i + 3, 10 * i + 6]);
    }
    events.reverse();
    const result = mergeIntervals(events);
    expect(result).toHaveLength(50000);
    expect(result[0]).toEqual([0, 6]);
    expect(result[49999]).toEqual([499990, 499996]);
  });
});
