## Approach 1: `Map` insertion order (the JavaScript answer)

A JavaScript `Map` iterates its keys **in insertion order**, and deleting then re-inserting a key moves it to the end. So a `Map` is already an ordered dictionary with O(1) operations:

- **Most recently used** = last key; **least recently used** = first key.
- To mark a key as used: `map.delete(key); map.set(key, value);` moves it to the end.
- To evict: `map.keys().next().value` is the oldest key. Getting the first element of an iterator is O(1).

```js
get(key) {
  if (!this.map.has(key)) return undefined;
  const value = this.map.get(key);
  this.map.delete(key);
  this.map.set(key, value);
  return value;
}

set(key, value) {
  if (this.map.has(key)) this.map.delete(key);
  else if (this.map.size >= this.capacity) {
    const oldest = this.map.keys().next().value;
    const evicted = this.map.get(oldest);
    this.map.delete(oldest);
    this.onEvict?.(oldest, evicted);
  }
  this.map.set(key, value);
  return this;
}
```

Note the `has` check in `get`: `if (!value)` would treat stored `0`, `''` or `undefined` values as misses. Note also the eviction happens only when inserting a **new** key. Updating an existing key must not evict, even at capacity.

The reference solution uses this approach, and an interviewer will usually accept it if you **explain why it's O(1)**: the spec requires insertion-ordered iteration, and engines implement `Map` as a hash table with an ordered entry list (V8 uses a deterministic hash table, a design by Tyler Close).

## Approach 2: hash map + doubly linked list (the language-agnostic answer)

Many interviewers want the classic structure, since it works in any language:

- A **doubly linked list** of nodes `{ key, value, prev, next }`, with sentinel `head` and `tail` nodes. Most recent at the tail.
- A **hash map** from key to node, for O(1) lookup.

Operations:
- `get`: look up the node, unlink it (O(1) thanks to `prev`/`next`) and append it before `tail`.
- `set` new key: if full, unlink `head.next` (the LRU node) and delete its key from the map; then append the new node.
- Sentinels remove all the "is this the first/last node?" special cases.

The **doubly** linked part matters: removing a node from the middle needs its predecessor, and a singly linked list would need an O(n) scan to find it. The node stores its key so eviction can delete the map entry.

## Complexity

All operations O(1) time; O(capacity) space. `keys()` is O(n).

## Edge cases

- Capacity 1: every new key evicts the previous one.
- Falsy values (`0`, `''`, `null`, `undefined`) are valid values. Use `has`.
- Keys like `NaN` and objects work because `Map` uses SameValueZero.
- `delete` and updates don't trigger `onEvict`; only capacity evictions do.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using a plain object | Keys are stringified (`1` and `'1'` collide), and objects become `"[object Object]"` |
| Tracking recency with an array and `indexOf`/`splice` | O(n) per operation |
| Evicting on update of an existing key | Loses an entry for no reason |
| `peek`/`has` updating recency | Observing the cache changes its behaviour |
| Singly linked list | O(n) removal |

## Real-world connection

- **Apollo Client / Relay** and **TanStack Query** bound memory with garbage collection of unused entries; libraries like `lru-cache` (used by npm itself) and `quick-lru` implement exactly this API.
- **Browsers:** the HTTP cache, the back/forward cache and image decode caches use LRU-like eviction.
- **Memoisation:** `reselect`'s `lruMemoize` and React's internal caches keep the last N results.
- **Service workers:** Workbox's `ExpirationPlugin({ maxEntries })` evicts the least recently used runtime-cached responses.

## Follow-ups

- **TTL:** store `{ value, expiresAt }` and treat expired entries as misses on `get` (lazy expiry), optionally with a periodic sweep.
- **Size-aware eviction:** evict by total byte size rather than count (`maxSize` + a `sizeCalculation` function), as image caches do.
- **LFU vs LRU:** LRU is fooled by one-off scans of many keys, which flush the useful entries. LFU, or hybrids like W-TinyLFU (used by Caffeine), resist that.
