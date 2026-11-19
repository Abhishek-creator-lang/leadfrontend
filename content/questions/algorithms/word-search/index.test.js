import canTrace from './index';

const board = () => [
  ['R', 'E', 'A', 'C'],
  ['S', 'T', 'X', 'T'],
  ['H', 'O', 'O', 'K'],
];

describe('canTrace', () => {
  test('finds words that exist', () => {
    expect(canTrace(board(), 'REACT')).toBe(true);
    expect(canTrace(board(), 'HOOK')).toBe(true);
    expect(canTrace(board(), 'SHOT')).toBe(true);
  });

  test('rejects words that need a reused tile', () => {
    expect(canTrace(board(), 'TEST')).toBe(false);
    expect(canTrace(board(), 'HOOH')).toBe(false);
  });

  test('rejects non-adjacent letters and diagonals', () => {
    expect(canTrace(board(), 'REST')).toBe(false);
    expect(canTrace(board(), 'STORE')).toBe(false);
    expect(canTrace(board(), 'RT')).toBe(false); // diagonal
  });

  test('single letters', () => {
    expect(canTrace(board(), 'K')).toBe(true);
    expect(canTrace(board(), 'Z')).toBe(false);
  });

  test('case-sensitive', () => {
    expect(canTrace(board(), 'react')).toBe(false);
  });

  test('word longer than the board', () => {
    expect(canTrace([['A']], 'AA')).toBe(false);
  });

  test('does not leave the board modified', () => {
    const b = board();
    canTrace(b, 'REACT');
    canTrace(b, 'TEST');
    expect(b).toEqual(board());
  });

  test('backtracks out of a dead end with repeated letters', () => {
    const b = [
      ['A', 'B', 'C', 'E'],
      ['S', 'F', 'E', 'S'],
      ['A', 'D', 'E', 'E'],
    ];
    expect(canTrace(b, 'ABCESEEEFS')).toBe(true);
    expect(canTrace(b, 'ABCB')).toBe(false);
  });

  test('adversarial board full of one letter fails fast', () => {
    const b = Array.from({ length: 20 }, () => new Array(20).fill('A'));
    expect(canTrace(b, 'A'.repeat(29) + 'B')).toBe(false);
  });

  test('long snake-shaped word on a 20 x 20 board', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const b = Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => letters[(r * 7 + c * 3) % 26]));
    // Trace a path: along row 5 from column 0 to 14, then down column 14 for 15 more cells.
    let word = '';
    for (let c = 0; c < 15; c++) word += b[5][c];
    for (let r = 6; r < 20; r++) word += b[r][14];
    expect(canTrace(b, word)).toBe(true);
    expect(canTrace(b, word + 'Q')).toBe(false);
  });
});
