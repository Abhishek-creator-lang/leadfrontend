import LRUCache from './index';

describe('LRUCache', () => {
  test('stores and retrieves values', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('missing')).toBeUndefined();
    expect(cache.size).toBe(1);
  });

  test('set returns the cache for chaining', () => {
    const cache = new LRUCache(2);
    expect(cache.set('a', 1).set('b', 2)).toBe(cache);
    expect(cache.size).toBe(2);
  });

  test('evicts the least recently set entry', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1).set('b', 2).set('c', 3);
    expect(cache.has('a')).toBe(false);
    expect(cache.keys()).toEqual(['b', 'c']);
  });

  test('get marks an entry as recently used', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1).set('b', 2);
    cache.get('a');
    cache.set('c', 3);
    expect(cache.keys()).toEqual(['a', 'c']);
  });

  test('updating a key refreshes it and never evicts', () => {
    const evicted = jest.fn();
    const cache = new LRUCache(2, { onEvict: evicted });
    cache.set('a', 1).set('b', 2).set('a', 10);
    expect(cache.size).toBe(2);
    expect(evicted).not.toHaveBeenCalled();
    expect(cache.get('a')).toBe(10);
    cache.set('c', 3);
    expect(cache.keys()).toEqual(['a', 'c']);
  });

  test('has and peek do not affect recency', () => {
    const cache = new LRUCache(2);
    cache.set('a', 1).set('b', 2);
    expect(cache.has('a')).toBe(true);
    expect(cache.peek('a')).toBe(1);
    cache.set('c', 3);
    expect(cache.has('a')).toBe(false);
  });

  test('onEvict receives the evicted key and value', () => {
    const evicted = jest.fn();
    const cache = new LRUCache(1, { onEvict: evicted });
    cache.set('x', 'first').set('y', 'second');
    expect(evicted).toHaveBeenCalledTimes(1);
    expect(evicted).toHaveBeenCalledWith('x', 'first');
  });

  test('delete removes entries without calling onEvict', () => {
    const evicted = jest.fn();
    const cache = new LRUCache(2, { onEvict: evicted });
    cache.set('a', 1);
    expect(cache.delete('a')).toBe(true);
    expect(cache.delete('a')).toBe(false);
    expect(cache.size).toBe(0);
    expect(evicted).not.toHaveBeenCalled();
  });

  test('falsy values are stored and returned correctly', () => {
    const cache = new LRUCache(3);
    cache.set('zero', 0).set('empty', '').set('undef', undefined);
    expect(cache.get('zero')).toBe(0);
    expect(cache.get('empty')).toBe('');
    expect(cache.has('undef')).toBe(true);
    // get('undef') must still refresh recency
    cache.get('undef');
    cache.set('new', 1);
    expect(cache.has('zero')).toBe(false);
    expect(cache.has('undef')).toBe(true);
  });

  test('supports object and NaN keys', () => {
    const cache = new LRUCache(2);
    const k = { id: 1 };
    cache.set(k, 'obj').set(NaN, 'nan');
    expect(cache.get(k)).toBe('obj');
    expect(cache.get({ id: 1 })).toBeUndefined();
    expect(cache.get(NaN)).toBe('nan');
  });

  test('stays at capacity under heavy use', () => {
    const cache = new LRUCache(3);
    for (let i = 0; i < 100; i++) cache.set(i, i * 2);
    expect(cache.size).toBe(3);
    expect(cache.keys()).toEqual([97, 98, 99]);
  });
});
