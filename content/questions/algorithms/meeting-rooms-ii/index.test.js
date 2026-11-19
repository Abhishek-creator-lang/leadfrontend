import minMeetingRooms from './index';

describe('minMeetingRooms', () => {
  test('two overlapping meetings and one that reuses a room', () => {
    expect(
      minMeetingRooms([
        [540, 600],
        [560, 620],
        [600, 660],
      ])
    ).toBe(2);
  });

  test('back-to-back meetings share a room', () => {
    expect(
      minMeetingRooms([
        [0, 30],
        [30, 60],
        [60, 90],
      ])
    ).toBe(1);
  });

  test('a long meeting overlapping several short ones', () => {
    expect(
      minMeetingRooms([
        [0, 100],
        [10, 20],
        [15, 25],
        [50, 60],
      ])
    ).toBe(3);
  });

  test('empty and single', () => {
    expect(minMeetingRooms([])).toBe(0);
    expect(minMeetingRooms([[5, 10]])).toBe(1);
  });

  test('identical meetings each need a room', () => {
    expect(
      minMeetingRooms([
        [10, 20],
        [10, 20],
        [10, 20],
      ])
    ).toBe(3);
  });

  test('unsorted input', () => {
    expect(
      minMeetingRooms([
        [70, 80],
        [0, 50],
        [40, 75],
        [5, 10],
      ])
    ).toBe(2);
  });

  test('does not mutate the input', () => {
    const input = [
      [30, 40],
      [0, 35],
    ];
    minMeetingRooms(input);
    expect(input).toEqual([
      [30, 40],
      [0, 35],
    ]);
  });

  test('large input', () => {
    // 100,000 meetings; meeting i runs [i, i + 50), so at most 50 overlap at once.
    const meetings = Array.from({ length: 100000 }, (_, i) => [i, i + 50]).reverse();
    expect(minMeetingRooms(meetings)).toBe(50);
  });

  test('large input with every meeting overlapping', () => {
    const meetings = Array.from({ length: 100000 }, (_, i) => [i, 200000 - i]);
    expect(minMeetingRooms(meetings)).toBe(100000);
  });
});
