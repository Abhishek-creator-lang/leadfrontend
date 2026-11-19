import mergeData from './index';

const makeSessions = () => [
  { user: 8, duration: 50, equipment: ['bench'] },
  { user: 7, duration: 150, equipment: ['dumbbell'] },
  { user: 1, duration: 10, equipment: ['barbell'] },
  { user: 7, duration: 100, equipment: ['bike', 'kettlebell'] },
  { user: 7, duration: 200, equipment: ['bike'] },
  { user: 2, duration: 200, equipment: ['treadmill'] },
  { user: 2, duration: 200, equipment: ['bike'] },
];

describe('mergeData', () => {
  test('merges the example', () => {
    expect(mergeData(makeSessions())).toEqual([
      { user: 8, duration: 50, equipment: ['bench'] },
      { user: 7, duration: 450, equipment: ['bike', 'dumbbell', 'kettlebell'] },
      { user: 1, duration: 10, equipment: ['barbell'] },
      { user: 2, duration: 400, equipment: ['bike', 'treadmill'] },
    ]);
  });

  test('empty input returns []', () => {
    expect(mergeData([])).toEqual([]);
  });

  test('keeps first-appearance order even for numeric ids', () => {
    const result = mergeData([
      { user: 30, duration: 1, equipment: [] },
      { user: 2, duration: 1, equipment: [] },
      { user: 10, duration: 1, equipment: [] },
    ]);
    expect(result.map((r) => r.user)).toEqual([30, 2, 10]);
  });

  test('single session is copied', () => {
    const input = [{ user: 1, duration: 5, equipment: ['mat'] }];
    const [record] = mergeData(input);
    expect(record).toEqual({ user: 1, duration: 5, equipment: ['mat'] });
    expect(record).not.toBe(input[0]);
    expect(record.equipment).not.toBe(input[0].equipment);
  });

  test('de-duplicates equipment within and across sessions', () => {
    expect(
      mergeData([
        { user: 1, duration: 1, equipment: ['rope', 'rope'] },
        { user: 1, duration: 2, equipment: ['rope', 'box'] },
      ])
    ).toEqual([{ user: 1, duration: 3, equipment: ['box', 'rope'] }]);
  });

  test('handles empty equipment lists', () => {
    expect(
      mergeData([
        { user: 3, duration: 10, equipment: [] },
        { user: 3, duration: 15, equipment: [] },
      ])
    ).toEqual([{ user: 3, duration: 25, equipment: [] }]);
  });

  test('handles user id 0', () => {
    expect(
      mergeData([
        { user: 0, duration: 1, equipment: ['a'] },
        { user: 0, duration: 1, equipment: ['b'] },
      ])
    ).toEqual([{ user: 0, duration: 2, equipment: ['a', 'b'] }]);
  });

  test('output records only have user, duration and equipment', () => {
    const [record] = mergeData([{ user: 1, duration: 1, equipment: [], note: 'x' }]);
    expect(Object.keys(record).sort()).toEqual(['duration', 'equipment', 'user']);
  });

  test('does not mutate the input', () => {
    const input = makeSessions();
    const snapshot = JSON.parse(JSON.stringify(input));
    mergeData(input);
    expect(input).toEqual(snapshot);
  });

  test('output equipment arrays are not shared with the input', () => {
    const input = [
      { user: 1, duration: 1, equipment: ['b', 'a'] },
      { user: 1, duration: 1, equipment: ['c'] },
    ];
    const [record] = mergeData(input);
    record.equipment.push('z');
    expect(input[0].equipment).toEqual(['b', 'a']);
    expect(input[1].equipment).toEqual(['c']);
  });
});
