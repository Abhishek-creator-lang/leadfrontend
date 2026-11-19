import Queue from './index';

describe('Queue', () => {
  test('starts empty', () => {
    const q = new Queue();
    expect(q.isEmpty()).toBe(true);
    expect(q.length()).toBe(0);
  });

  test('enqueue returns the new length', () => {
    const q = new Queue();
    expect(q.enqueue('a')).toBe(1);
    expect(q.enqueue('b')).toBe(2);
  });

  test('dequeue returns items in insertion order', () => {
    const q = new Queue();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
    expect(q.isEmpty()).toBe(true);
  });

  test('front and back peek without removing', () => {
    const q = new Queue();
    q.enqueue('first');
    q.enqueue('middle');
    q.enqueue('last');
    expect(q.front()).toBe('first');
    expect(q.back()).toBe('last');
    expect(q.length()).toBe(3);
  });

  test('empty queue returns undefined', () => {
    const q = new Queue();
    expect(q.dequeue()).toBeUndefined();
    expect(q.front()).toBeUndefined();
    expect(q.back()).toBeUndefined();
    expect(q.length()).toBe(0);
  });

  test('can be reused after being drained', () => {
    const q = new Queue();
    q.enqueue(1);
    q.dequeue();
    expect(q.isEmpty()).toBe(true);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.front()).toBe(2);
    expect(q.back()).toBe(3);
    expect(q.dequeue()).toBe(2);
    expect(q.length()).toBe(1);
  });

  test('stores undefined as an item', () => {
    const q = new Queue();
    q.enqueue(undefined);
    expect(q.isEmpty()).toBe(false);
    expect(q.length()).toBe(1);
    expect(q.dequeue()).toBeUndefined();
    expect(q.isEmpty()).toBe(true);
  });

  test('instances do not share state', () => {
    const a = new Queue();
    const b = new Queue();
    a.enqueue('x');
    expect(b.isEmpty()).toBe(true);
  });

  test('handles a large number of interleaved operations', () => {
    const q = new Queue();
    for (let i = 0; i < 200000; i++) q.enqueue(i);
    let expected = 0;
    for (let i = 0; i < 100000; i++) {
      expect(q.dequeue()).toBe(expected++);
      q.enqueue(200000 + i);
    }
    expect(q.length()).toBe(200000);
    expect(q.front()).toBe(100000);
    expect(q.back()).toBe(299999);
  });
});
