import createSheet from './index';

describe('createSheet', () => {
  test('empty cells are null and have an empty raw value', () => {
    const sheet = createSheet();
    expect(sheet.get('A1')).toBeNull();
    expect(sheet.getRaw('A1')).toBe('');
  });

  test('stores numbers and text', () => {
    const sheet = createSheet();
    sheet.set('A1', '42');
    sheet.set('A2', ' -3.5 ');
    sheet.set('A3', 'hello');
    expect(sheet.get('A1')).toBe(42);
    expect(sheet.get('A2')).toBe(-3.5);
    expect(sheet.get('A3')).toBe('hello');
    expect(sheet.getRaw('A2')).toBe(' -3.5 ');
  });

  test('refs are case-insensitive and invalid refs throw', () => {
    const sheet = createSheet();
    sheet.set('ab12', '7');
    expect(sheet.get('AB12')).toBe(7);
    expect(() => sheet.set('A0', '1')).toThrow();
    expect(() => sheet.get('1A')).toThrow();
  });

  test('evaluates arithmetic with precedence, parentheses and unary minus', () => {
    const sheet = createSheet();
    sheet.set('A1', '=1 + 2 * 3');
    sheet.set('A2', '=(1 + 2) * 3');
    sheet.set('A3', '=10 - 4 - 3');
    sheet.set('A4', '=-2 * --3');
    sheet.set('A5', '=7 / 2');
    expect(sheet.get('A1')).toBe(7);
    expect(sheet.get('A2')).toBe(9);
    expect(sheet.get('A3')).toBe(3);
    expect(sheet.get('A4')).toBe(-6);
    expect(sheet.get('A5')).toBe(3.5);
  });

  test('formulas reference other cells; empty cells count as 0', () => {
    const sheet = createSheet();
    sheet.set('A1', '10');
    sheet.set('B1', '=a1 * 2 + Z99');
    expect(sheet.get('B1')).toBe(20);
  });

  test('a bare reference returns the referenced value, even text', () => {
    const sheet = createSheet();
    sheet.set('A1', 'hello');
    sheet.set('B1', '=A1');
    expect(sheet.get('B1')).toBe('hello');
  });

  test('SUM, MIN and MAX with ranges and expressions', () => {
    const sheet = createSheet();
    sheet.set('A1', '1');
    sheet.set('A2', '2');
    sheet.set('B1', '3');
    sheet.set('B2', 'text');
    sheet.set('C1', '=SUM(A1:B2)');
    sheet.set('C2', '=sum(B2:A1, 10, A1 * 100)');
    sheet.set('C3', '=MIN(A1:B1) + MAX(A1:B2)');
    sheet.set('C4', '=SUM(D1:D3) + MAX(D1:D3)');
    expect(sheet.get('C1')).toBe(6);
    expect(sheet.get('C2')).toBe(116);
    expect(sheet.get('C3')).toBe(4);
    expect(sheet.get('C4')).toBe(0);
  });

  test('recomputes transitive dependents after a change', () => {
    const sheet = createSheet();
    sheet.set('A1', '10');
    sheet.set('A2', '32');
    sheet.set('A3', '=SUM(A1:A2) / 2');
    sheet.set('A4', '=A3 + 1');
    expect(sheet.get('A4')).toBe(22);
    sheet.set('A1', '50');
    expect(sheet.get('A3')).toBe(41);
    expect(sheet.get('A4')).toBe(42);
    sheet.set('A2', '');
    expect(sheet.get('A4')).toBe(26);
  });

  test('cells set before their dependencies exist update later', () => {
    const sheet = createSheet();
    sheet.set('B1', '=A1 * 3');
    expect(sheet.get('B1')).toBe(0);
    sheet.set('A1', '5');
    expect(sheet.get('B1')).toBe(15);
  });

  test('replacing a formula drops its old dependencies', () => {
    const sheet = createSheet();
    sheet.set('A1', '1');
    sheet.set('B1', '=A1');
    sheet.set('B1', '=100');
    sheet.set('A1', '2');
    expect(sheet.get('B1')).toBe(100);
  });

  test('detects cycles, including self-references, and propagates them', () => {
    const sheet = createSheet();
    sheet.set('A1', '=A1 + 1');
    sheet.set('B1', '=B2 + 1');
    sheet.set('B2', '=B3 * 2');
    sheet.set('B3', '=B1');
    sheet.set('C1', '=B2 + 5');
    expect(sheet.get('A1')).toBe('#CYCLE!');
    expect(sheet.get('B1')).toBe('#CYCLE!');
    expect(sheet.get('B3')).toBe('#CYCLE!');
    expect(sheet.get('C1')).toBe('#CYCLE!');
  });

  test('breaking a cycle restores values', () => {
    const sheet = createSheet();
    sheet.set('A1', '=B1 + 1');
    sheet.set('B1', '=A1 + 1');
    expect(sheet.get('A1')).toBe('#CYCLE!');
    sheet.set('B1', '4');
    expect(sheet.get('A1')).toBe(5);
    sheet.set('B1', '=A1');
    expect(sheet.get('B1')).toBe('#CYCLE!');
  });

  test('reports division by zero, text in arithmetic, bad syntax and unknown functions', () => {
    const sheet = createSheet();
    sheet.set('A1', 'abc');
    sheet.set('B1', '=1 / (2 - 2)');
    sheet.set('B2', '=A1 + 1');
    sheet.set('B3', '=1 +');
    sheet.set('B4', '=FOO(1)');
    sheet.set('B5', '=SUM(A1)');
    sheet.set('B6', '=A1:A2');
    expect(sheet.get('B1')).toBe('#DIV/0!');
    expect(sheet.get('B2')).toBe('#VALUE!');
    expect(sheet.get('B3')).toBe('#ERROR!');
    expect(sheet.get('B4')).toBe('#NAME?');
    expect(sheet.get('B5')).toBe('#VALUE!');
    expect(sheet.get('B6')).toBe('#ERROR!');
  });

  test('errors propagate through formulas and ranges', () => {
    const sheet = createSheet();
    sheet.set('A1', '=1/0');
    sheet.set('A2', '=A1 * 2');
    sheet.set('A3', '=SUM(A1:A2)');
    expect(sheet.get('A2')).toBe('#DIV/0!');
    expect(sheet.get('A3')).toBe('#DIV/0!');
    sheet.set('A1', '3');
    expect(sheet.get('A3')).toBe(9);
  });

  test('unrelated changes leave other cells untouched', () => {
    const sheet = createSheet();
    sheet.set('A1', '1');
    sheet.set('B1', '=A1 + 1');
    sheet.set('C1', '=5');
    const before = sheet.get('B1');
    sheet.set('C2', '=C1 * 2');
    expect(sheet.get('B1')).toBe(before);
    expect(sheet.get('C2')).toBe(10);
  });
});
