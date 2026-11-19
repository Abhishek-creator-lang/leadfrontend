import BinarySearchTree from './index';

function build(values) {
  const t = new BinarySearchTree();
  values.forEach((v) => t.insert(v));
  return t;
}

describe('BinarySearchTree', () => {
  test('empty tree', () => {
    const t = new BinarySearchTree();
    expect(t.size()).toBe(0);
    expect(t.has(1)).toBe(false);
    expect(t.min()).toBeUndefined();
    expect(t.max()).toBeUndefined();
    expect(t.inOrder()).toEqual([]);
    expect(t.remove(1)).toBe(false);
  });

  test('insert, has and duplicates', () => {
    const t = new BinarySearchTree();
    expect(t.insert(1700)).toBe(true);
    expect(t.insert(1200)).toBe(true);
    expect(t.insert(2400)).toBe(true);
    expect(t.insert(1200)).toBe(false);
    expect(t.size()).toBe(3);
    expect(t.has(2400)).toBe(true);
    expect(t.has(9999)).toBe(false);
  });

  test('inOrder returns ascending values; min and max', () => {
    const t = build([50, 30, 70, 20, 40, 60, 80, -5, 0]);
    expect(t.inOrder()).toEqual([-5, 0, 20, 30, 40, 50, 60, 70, 80]);
    expect(t.min()).toBe(-5);
    expect(t.max()).toBe(80);
  });

  test('remove a leaf', () => {
    const t = build([50, 30, 70]);
    expect(t.remove(30)).toBe(true);
    expect(t.inOrder()).toEqual([50, 70]);
    expect(t.has(30)).toBe(false);
  });

  test('remove a node with one child', () => {
    const t = build([50, 30, 20, 70]);
    expect(t.remove(30)).toBe(true);
    expect(t.inOrder()).toEqual([20, 50, 70]);
  });

  test('remove a node with two children', () => {
    const t = build([50, 30, 70, 60, 80, 65]);
    expect(t.remove(70)).toBe(true);
    expect(t.inOrder()).toEqual([30, 50, 60, 65, 80]);
    expect(t.size()).toBe(5);
  });

  test('remove the root in every shape', () => {
    const a = build([10]);
    expect(a.remove(10)).toBe(true);
    expect(a.inOrder()).toEqual([]);
    expect(a.size()).toBe(0);

    const b = build([10, 5]);
    b.remove(10);
    expect(b.inOrder()).toEqual([5]);
    expect(b.min()).toBe(5);

    const c = build([10, 5, 15, 12]);
    c.remove(10);
    expect(c.inOrder()).toEqual([5, 12, 15]);
    c.insert(11);
    expect(c.inOrder()).toEqual([5, 11, 12, 15]);
  });

  test('removing a missing value changes nothing', () => {
    const t = build([3, 1, 2]);
    expect(t.remove(7)).toBe(false);
    expect(t.size()).toBe(3);
  });

  test('sorted inserts (degenerate chain) still work', () => {
    const t = new BinarySearchTree();
    for (let i = 0; i < 3000; i++) t.insert(i);
    expect(t.size()).toBe(3000);
    expect(t.max()).toBe(2999);
    expect(t.has(2500)).toBe(true);
    expect(t.remove(0)).toBe(true);
    expect(t.inOrder()[0]).toBe(1);
  });

  test('random operations match a Set', () => {
    const t = new BinarySearchTree();
    const ref = new Set();
    for (let i = 0; i < 50000; i++) {
      const v = Math.floor(Math.random() * 5000);
      if (Math.random() < 0.6) {
        expect(t.insert(v)).toBe(!ref.has(v));
        ref.add(v);
      } else {
        expect(t.remove(v)).toBe(ref.delete(v));
      }
    }
    expect(t.size()).toBe(ref.size);
    expect(t.inOrder()).toEqual([...ref].sort((a, b) => a - b));
  });
});
