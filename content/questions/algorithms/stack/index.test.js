import Stack from './index';

describe('Stack', () => {
  test('starts empty', () => {
    const s = new Stack();
    expect(s.isEmpty()).toBe(true);
    expect(s.length()).toBe(0);
  });

  test('push returns the new length', () => {
    const s = new Stack();
    expect(s.push('a')).toBe(1);
    expect(s.push('b')).toBe(2);
    expect(s.length()).toBe(2);
  });

  test('pop returns items in reverse insertion order', () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    s.push(3);
    expect(s.pop()).toBe(3);
    expect(s.pop()).toBe(2);
    expect(s.pop()).toBe(1);
    expect(s.isEmpty()).toBe(true);
  });

  test('peek does not remove the item', () => {
    const s = new Stack();
    s.push('x');
    s.push('y');
    expect(s.peek()).toBe('y');
    expect(s.peek()).toBe('y');
    expect(s.length()).toBe(2);
  });

  test('pop and peek on an empty stack return undefined', () => {
    const s = new Stack();
    expect(s.pop()).toBeUndefined();
    expect(s.peek()).toBeUndefined();
    expect(s.length()).toBe(0);
  });

  test('can store undefined and null as items', () => {
    const s = new Stack();
    s.push(undefined);
    s.push(null);
    expect(s.isEmpty()).toBe(false);
    expect(s.length()).toBe(2);
    expect(s.pop()).toBeNull();
    expect(s.pop()).toBeUndefined();
    expect(s.isEmpty()).toBe(true);
  });

  test('instances do not share state', () => {
    const a = new Stack();
    const b = new Stack();
    a.push(1);
    expect(b.isEmpty()).toBe(true);
    expect(b.peek()).toBeUndefined();
  });

  test('interleaved push and pop', () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    s.pop();
    s.push(3);
    expect(s.peek()).toBe(3);
    expect(s.length()).toBe(2);
  });

  test('handles many items', () => {
    const s = new Stack();
    for (let i = 0; i < 100000; i++) s.push(i);
    expect(s.length()).toBe(100000);
    let sum = 0;
    while (!s.isEmpty()) sum += s.pop();
    expect(sum).toBe((99999 * 100000) / 2);
  });
});
