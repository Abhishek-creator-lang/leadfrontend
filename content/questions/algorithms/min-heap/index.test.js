import MinHeap from './index';

describe('MinHeap', () => {
  test('empty heap', () => {
    const h = new MinHeap();
    expect(h.size()).toBe(0);
    expect(h.peek()).toBeUndefined();
    expect(h.pop()).toBeUndefined();
  });

  test('push returns the new size', () => {
    const h = new MinHeap();
    expect(h.push(3)).toBe(1);
    expect(h.push(1)).toBe(2);
  });

  test('pops numbers in ascending order by default', () => {
    const h = new MinHeap();
    [5, 1, 4, 1, 9, -2, 6].forEach((n) => h.push(n));
    const out = [];
    while (h.size() > 0) out.push(h.pop());
    expect(out).toEqual([-2, 1, 1, 4, 5, 6, 9]);
  });

  test('peek does not remove', () => {
    const h = new MinHeap();
    h.push(7);
    h.push(2);
    expect(h.peek()).toBe(2);
    expect(h.size()).toBe(2);
  });

  test('custom comparator on objects', () => {
    const h = new MinHeap((a, b) => a.deadline - b.deadline);
    h.push({ name: 'render list', deadline: 250 });
    h.push({ name: 'handle click', deadline: 10 });
    h.push({ name: 'prefetch', deadline: 5000 });
    expect(h.peek().name).toBe('handle click');
    expect(h.pop().name).toBe('handle click');
    expect(h.pop().name).toBe('render list');
    expect(h.size()).toBe(1);
  });

  test('reversed comparator acts as a max-heap', () => {
    const h = new MinHeap((a, b) => b - a);
    [3, 8, 1, 5].forEach((n) => h.push(n));
    expect(h.pop()).toBe(8);
    expect(h.pop()).toBe(5);
  });

  test('smaller child on the right is chosen when sifting down', () => {
    const h = new MinHeap();
    [1, 5, 2].forEach((n) => h.push(n));
    expect(h.pop()).toBe(1);
    expect(h.pop()).toBe(2);
    expect(h.pop()).toBe(5);
  });

  test('interleaved pushes and pops stay ordered', () => {
    const h = new MinHeap();
    h.push(10);
    h.push(4);
    expect(h.pop()).toBe(4);
    h.push(7);
    h.push(1);
    expect(h.pop()).toBe(1);
    expect(h.pop()).toBe(7);
    expect(h.pop()).toBe(10);
    expect(h.pop()).toBeUndefined();
  });

  test('large random workload', () => {
    const h = new MinHeap();
    const values = Array.from({ length: 200000 }, () => Math.floor(Math.random() * 1e6));
    values.forEach((v) => h.push(v));
    const out = [];
    while (h.size() > 0) out.push(h.pop());
    expect(out).toEqual(values.slice().sort((a, b) => a - b));
  });
});
