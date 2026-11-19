import LinkedList from './index';

function from(values) {
  const list = new LinkedList();
  values.forEach((v) => list.push(v));
  return list;
}

describe('LinkedList', () => {
  test('push and unshift return the new length', () => {
    const list = new LinkedList();
    expect(list.push('b')).toBe(1);
    expect(list.unshift('a')).toBe(2);
    expect(list.push('c')).toBe(3);
    expect(list.toArray()).toEqual(['a', 'b', 'c']);
    expect(list.length()).toBe(3);
  });

  test('pop and shift remove from the ends', () => {
    const list = from([1, 2, 3, 4]);
    expect(list.pop()).toBe(4);
    expect(list.shift()).toBe(1);
    expect(list.toArray()).toEqual([2, 3]);
    expect(list.length()).toBe(2);
  });

  test('empty list returns undefined and stays consistent', () => {
    const list = new LinkedList();
    expect(list.pop()).toBeUndefined();
    expect(list.shift()).toBeUndefined();
    expect(list.get(0)).toBeUndefined();
    expect(list.toArray()).toEqual([]);
    expect(list.length()).toBe(0);
  });

  test('removing the only node resets the list', () => {
    const list = from(['only']);
    expect(list.pop()).toBe('only');
    list.push('x');
    expect(list.toArray()).toEqual(['x']);
    expect(list.shift()).toBe('x');
    list.unshift('y');
    expect(list.toArray()).toEqual(['y']);
  });

  test('get reads by index and rejects out-of-range indices', () => {
    const list = from(['a', 'b', 'c', 'd', 'e']);
    expect(list.get(0)).toBe('a');
    expect(list.get(2)).toBe('c');
    expect(list.get(4)).toBe('e');
    expect(list.get(5)).toBeUndefined();
    expect(list.get(-1)).toBeUndefined();
  });

  test('insertAt handles start, middle, end and invalid indices', () => {
    const list = from([1, 3]);
    expect(list.insertAt(1, 2)).toBe(true);
    expect(list.insertAt(0, 0)).toBe(true);
    expect(list.insertAt(4, 4)).toBe(true);
    expect(list.insertAt(9, 9)).toBe(false);
    expect(list.insertAt(-1, 9)).toBe(false);
    expect(list.toArray()).toEqual([0, 1, 2, 3, 4]);
    expect(list.length()).toBe(5);
  });

  test('removeAt handles start, middle, end and invalid indices', () => {
    const list = from(['a', 'b', 'c', 'd', 'e']);
    expect(list.removeAt(2)).toBe('c');
    expect(list.removeAt(0)).toBe('a');
    expect(list.removeAt(2)).toBe('e');
    expect(list.removeAt(5)).toBeUndefined();
    expect(list.toArray()).toEqual(['b', 'd']);
    expect(list.length()).toBe(2);
  });

  test('reverse relinks the nodes in place', () => {
    const list = from([1, 2, 3, 4]);
    expect(list.reverse()).toBe(list);
    expect(list.toArray()).toEqual([4, 3, 2, 1]);
    // Ends are still correct after reversing.
    expect(list.pop()).toBe(1);
    expect(list.shift()).toBe(4);
    list.push(9);
    expect(list.toArray()).toEqual([3, 2, 9]);
  });

  test('reverse on empty and single-item lists', () => {
    expect(new LinkedList().reverse().toArray()).toEqual([]);
    expect(from(['x']).reverse().toArray()).toEqual(['x']);
  });

  test('handles a large list efficiently', () => {
    const list = new LinkedList();
    for (let i = 0; i < 100000; i++) list.push(i);
    for (let i = 0; i < 50000; i++) list.pop();
    for (let i = 0; i < 50000; i++) list.unshift(-1);
    expect(list.length()).toBe(100000);
    expect(list.get(50000)).toBe(0);
    expect(list.get(99999)).toBe(49999);
  });
});
