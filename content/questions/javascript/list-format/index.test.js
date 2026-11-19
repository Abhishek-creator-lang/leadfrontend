import listFormat from './index';

describe('listFormat', () => {
  test('empty list', () => {
    expect(listFormat([])).toBe('');
  });

  test('one, two and three items', () => {
    expect(listFormat(['Ana'])).toBe('Ana');
    expect(listFormat(['Ana', 'Ben'])).toBe('Ana and Ben');
    expect(listFormat(['Ana', 'Ben', 'Cy'])).toBe('Ana, Ben and Cy');
  });

  test('ignores empty strings', () => {
    expect(listFormat(['Ana', '', 'Ben'])).toBe('Ana and Ben');
    expect(listFormat(['', ''])).toBe('');
  });

  test('length truncates with "N others"', () => {
    expect(listFormat(['Ana', 'Ben', 'Cy', 'Dee', 'Eli'], { length: 3 })).toBe(
      'Ana, Ben, Cy and 2 others'
    );
  });

  test('singular "1 other"', () => {
    expect(listFormat(['Ana', 'Ben', 'Cy'], { length: 2 })).toBe('Ana, Ben and 1 other');
    expect(listFormat(['Ana', 'Ben'], { length: 1 })).toBe('Ana and 1 other');
  });

  test('length is ignored when not positive or not smaller than the count', () => {
    expect(listFormat(['Ana', 'Ben'], { length: 0 })).toBe('Ana and Ben');
    expect(listFormat(['Ana', 'Ben'], { length: -1 })).toBe('Ana and Ben');
    expect(listFormat(['Ana', 'Ben'], { length: 2 })).toBe('Ana and Ben');
    expect(listFormat(['Ana', 'Ben'], { length: 5 })).toBe('Ana and Ben');
  });

  test('sorted', () => {
    expect(listFormat(['Cy', 'Ana', 'Ben'], { sorted: true })).toBe('Ana, Ben and Cy');
  });

  test('unique keeps first occurrences', () => {
    expect(listFormat(['Ben', 'Ana', 'Ben'], { unique: true })).toBe('Ben and Ana');
  });

  test('empty strings do not count toward others', () => {
    expect(listFormat(['Ana', '', 'Ben', ''], { length: 1 })).toBe('Ana and 1 other');
  });

  test('options are applied in order: unique, sorted, length', () => {
    const names = ['Eli', 'Ana', 'Eli', 'Cy', 'Ben', 'Ana'];
    expect(listFormat(names, { unique: true, sorted: true, length: 2 })).toBe(
      'Ana, Ben and 2 others'
    );
  });

  test('does not mutate the input', () => {
    const input = ['Cy', 'Ana', 'Cy'];
    listFormat(input, { sorted: true, unique: true });
    expect(input).toEqual(['Cy', 'Ana', 'Cy']);
  });
});
