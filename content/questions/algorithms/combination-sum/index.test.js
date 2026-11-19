import combinationSum from './index';

// Order-insensitive at both levels.
const normalize = (lists) => lists.map((l) => JSON.stringify(l.slice().sort((a, b) => a - b))).sort();

// Independent count via DP (number of multisets).
function countCombinations(sizes, target) {
  const ways = new Array(target + 1).fill(0);
  ways[0] = 1;
  for (const s of sizes) for (let a = s; a <= target; a++) ways[a] += ways[a - s];
  return ways[target];
}

describe('combinationSum', () => {
  test('basic example', () => {
    expect(normalize(combinationSum([4, 8, 12], 16))).toEqual(
      normalize([[4, 4, 4, 4], [4, 4, 8], [4, 12], [8, 8]])
    );
  });

  test('single combination', () => {
    expect(normalize(combinationSum([3, 5], 11))).toEqual(normalize([[3, 3, 5]]));
  });

  test('no combination', () => {
    expect(combinationSum([6], 4)).toEqual([]);
  });

  test('zero target', () => {
    expect(combinationSum([5, 2], 0)).toEqual([[]]);
  });

  test('unsorted sizes and no duplicate combinations', () => {
    const result = combinationSum([7, 3, 2], 7);
    expect(normalize(result)).toEqual(normalize([[7], [2, 2, 3]]));
  });

  test('every combination sums to the target', () => {
    const result = combinationSum([2, 3, 5], 15);
    for (const combo of result) expect(combo.reduce((a, b) => a + b, 0)).toBe(15);
    expect(new Set(normalize(result)).size).toBe(result.length);
    expect(result).toHaveLength(countCombinations([2, 3, 5], 15));
  });

  test('does not mutate the input', () => {
    const sizes = [8, 4];
    combinationSum(sizes, 12);
    expect(sizes).toEqual([8, 4]);
  });

  test('larger search space', () => {
    const sizes = [2, 3, 5, 7, 11, 13];
    const result = combinationSum(sizes, 60);
    expect(result).toHaveLength(countCombinations(sizes, 60));
    expect(new Set(normalize(result)).size).toBe(result.length);
  });
});
