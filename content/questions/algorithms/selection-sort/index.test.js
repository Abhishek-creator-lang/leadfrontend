import selectionSort from './index';

const ascending = (arr) => arr.slice().sort((a, b) => a - b);

describe('selectionSort', () => {
  test('sorts a small array', () => {
    expect(selectionSort([30, 10, 50, 20, 10])).toEqual([10, 10, 20, 30, 50]);
  });

  test('sorts in place and returns the same reference', () => {
    const input = [9, 8, 7];
    expect(selectionSort(input)).toBe(input);
    expect(input).toEqual([7, 8, 9]);
  });

  test('empty and single-element arrays', () => {
    expect(selectionSort([])).toEqual([]);
    expect(selectionSort([1])).toEqual([1]);
  });

  test('already sorted input stays sorted', () => {
    expect(selectionSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  test('negatives, fractions and numeric order', () => {
    expect(selectionSort([3, -0.5, 20, 100, -7])).toEqual([-7, -0.5, 3, 20, 100]);
  });

  test('performs at most n - 1 swaps (writes stay small)', () => {
    // A proxy counts writes: each swap is two writes.
    const data = [5, 1, 4, 2, 8, 0, 3, 7, 6, 9];
    let writes = 0;
    const tracked = new Proxy(data, {
      set(target, key, value) {
        if (key !== 'length') writes++;
        target[key] = value;
        return true;
      },
    });
    selectionSort(tracked);
    expect(data).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(writes).toBeLessThanOrEqual(2 * (data.length - 1));
  });

  test('random arrays match a reference sort', () => {
    for (let n = 0; n < 50; n++) {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 20) - 10);
      const expected = ascending(arr);
      expect(selectionSort(arr)).toEqual(expected);
    }
  });

  test('sorts a few thousand random numbers', () => {
    const arr = Array.from({ length: 4000 }, () => Math.random() * 1000);
    const expected = ascending(arr);
    expect(selectionSort(arr)).toEqual(expected);
  });
});
