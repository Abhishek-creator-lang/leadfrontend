import isBalanced from './index';

describe('isBalanced', () => {
  test('balanced code snippets', () => {
    expect(isBalanced('const f = (a) => { return [a, b]; }')).toBe(true);
    expect(isBalanced('if (x) { y[0] = (1 + 2); }')).toBe(true);
  });

  test('wrong nesting order', () => {
    expect(isBalanced('call(arr[0)]')).toBe(false);
    expect(isBalanced('([)]')).toBe(false);
  });

  test('unclosed opener', () => {
    expect(isBalanced('{ open: true')).toBe(false);
    expect(isBalanced('((')).toBe(false);
  });

  test('closer without an opener', () => {
    expect(isBalanced('done) ')).toBe(false);
    expect(isBalanced(')(')).toBe(false);
  });

  test('wrong kind of closer', () => {
    expect(isBalanced('(]')).toBe(false);
    expect(isBalanced('{)')).toBe(false);
  });

  test('empty and bracket-free strings', () => {
    expect(isBalanced('')).toBe(true);
    expect(isBalanced('no brackets at all')).toBe(true);
  });

  test('deep nesting', () => {
    expect(isBalanced('{[({[()]})]}')).toBe(true);
    expect(isBalanced('{[({[(])})]}')).toBe(false);
  });

  test('ignores other characters including angle brackets and quotes', () => {
    expect(isBalanced('<div class="a">{items.map((x) => <li>{x}</li>)}</div>')).toBe(true);
  });

  test('very long input', () => {
    const half = 300000;
    const deep = '('.repeat(half) + '[]'.repeat(1000) + ')'.repeat(half);
    expect(isBalanced(deep)).toBe(true);
    expect(isBalanced(deep + ')')).toBe(false);
    expect(isBalanced('{}'.repeat(500000))).toBe(true);
  });
});
