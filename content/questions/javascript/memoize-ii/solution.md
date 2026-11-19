## Approach: a trie of `Map`s

Treat the argument list as a **path**. Each level of a trie is a node holding a `Map` from one argument value to the next node. Walking `args[0]`, then `args[1]`, and so on leads to the node for that exact argument list, and that node stores the result.

```
root
 ├─ 2 ──► node ─ 3 ──► node { hasValue: true, value: 6 }
 └─ 3 ──► node ─ 2 ──► node { hasValue: true, value: 6 }
```

Each node is `{ children: Map, hasValue: boolean, value: any }`.

1. Start at `root` and, for each argument, get or create the child node for that value.
2. At the final node, return `value` if `hasValue` is set.
3. Otherwise call `func.apply(this, args)`, store the result, set `hasValue`, and return it.

Why this satisfies the requirements:

- `Map` keys use SameValueZero, so `1 !== '1'`, objects match by identity, and `NaN` works.
- Different argument counts end at different nodes: `f(1)` stops at depth 1 and `f(1, undefined)` at depth 2, and `f()` uses `root` itself.
- There is no string encoding, so there is nothing to collide.
- `hasValue` is separate from `value`, so `undefined` results are cached.

Throwing is handled naturally: the result is stored only after `func` returns. The nodes created on the way down remain, which is harmless (they are reused on the retry).

`clear()` replaces `root` with a fresh node.

## Complexity

Each call is O(k) for k arguments (one `Map` lookup per argument). Space is O(total distinct path nodes), which is at most O(k) new nodes per distinct call.

## Alternatives and their problems

| Key strategy | Problem |
|---|---|
| `args.join(',')` | `('a,b')` collides with `('a', 'b')`; objects become `[object Object]` |
| `JSON.stringify(args)` | Drops functions and `undefined` inside objects (`[undefined]` becomes `[null]`), throws on cycles and BigInt, compares objects by value instead of identity, O(size of data) per call |
| Nested `Map`s with no "has value" flag | `undefined` results are recomputed, and a prefix cannot also be a full key |
| An array of `[args, result]` pairs scanned linearly | O(n) lookups |

## Edge cases

- `f()` with zero arguments is stored on the root node.
- A shorter argument list being a prefix of a longer one (`f(1)` and `f(1, 2)`) works, because every node can both hold a value and have children.
- `this` is not part of the key. For per-instance caching, either memoize per instance or add `this` as the first path segment.

## Common mistakes

- Forgetting the length dimension, so trailing `undefined` arguments collide with shorter calls.
- Using a plain object for the children, which coerces keys to strings.
- Caching before calling `func`, so a throw leaves a bogus entry.

## Follow-ups

- **Garbage collection:** for object arguments, use a `WeakMap` for children whose key is an object and a `Map` for primitives. When the object is collected, its whole subtree goes with it. This is how libraries such as `weak-memoize` / `reselect`'s `weakMapMemoize` work.
- **Serialising resolver:** acceptable when arguments are small, JSON-safe values (IDs, flags) and value equality is actually what you want.
- **Bounded size:** keep a separate LRU list of leaf nodes and prune empty branches on eviction, or simply bound to the most recent N calls the way `reselect`'s `lruMemoize` defaults to a cache size of 1.
