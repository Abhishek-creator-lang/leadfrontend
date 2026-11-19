Implement an `LRUCache` class: a key-value cache with a fixed `capacity`. When adding a new key would exceed the capacity, it evicts the **least recently used** entry.

"Used" means read with `get` or written with `set`. `has` and `peek` do **not** count as a use.

```js
const cache = new LRUCache(2);

cache.set('a', 1);
cache.set('b', 2);
cache.get('a');    // 1  ('a' is now the most recently used)
cache.set('c', 3); // evicts 'b', the least recently used
cache.has('b');    // false
cache.keys();      // ['a', 'c']  (least to most recently used)
```

## API

| Member | Behaviour |
|---|---|
| `constructor(capacity, { onEvict }?)` | `capacity` is a positive integer. `onEvict(key, value)` is called when an entry is evicted for space. |
| `get(key)` | Returns the value and marks the key as most recently used, or returns `undefined` if missing. |
| `set(key, value)` | Inserts or updates, marking the key as most recently used. Evicts if needed. Returns `this`. |
| `has(key)` | Whether the key is present. Doesn't affect recency. |
| `peek(key)` | Returns the value without affecting recency. |
| `delete(key)` | Removes the key; returns `true` if it was present. Doesn't call `onEvict`. |
| `size` | Getter: current number of entries. |
| `keys()` | Array of keys from least to most recently used. |

## Requirements

- `get`, `set`, `has`, `peek` and `delete` must be **O(1)**.
- Updating an existing key never evicts anything.
- Keys can be any value (objects, `NaN`, `0`...), compared like `Map` keys.

## Follow-up

- Implement it once with `Map` ordering and once with a hash map plus doubly linked list. Why does the second exist?
- How would you add a time-to-live per entry?
- Where do LRU caches appear in front-end stacks?
