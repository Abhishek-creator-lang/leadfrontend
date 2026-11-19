## Approach

Build the result into a fresh `{}` and fold each argument into it with a helper `mergeInto(target, source)`:

- For each own key of `source` (skipping `__proto__` and `undefined` values):
  - if **both** `target[key]` and `source[key]` are plain objects → recurse: `mergeInto(target[key], source[key])`;
  - otherwise → `target[key] = cloneData(source[key])`.

`cloneData` deep-copies plain objects and arrays (reusing `mergeInto({}, obj)` for objects) and returns anything else as is.

### Why is it safe to recurse into `target[key]`?

Because everything inside `target` was **created by us**: either copied with `cloneData` or built by an earlier `mergeInto`. We never store an input's object directly, so merging "into" a nested target never mutates a caller's data. This invariant is the crux of the problem; the naive version (`target[key] = source[key]` and later merging into it) silently mutates the first object that contributed that branch.

## Complexity

O(N) time and space, where N is the total number of keys/values across all arguments: every value is visited once when copied or merged.

## Design decisions to state

| Question | Choice here | Alternatives |
|---|---|---|
| Arrays | replace | lodash `merge`: by index; webpack-merge: concat |
| `undefined` in a later object | keep the earlier value | overwrite (that's what spread / `Object.assign` do) |
| `null` | overwrites | some config systems treat `null` as "unset" |
| Class instances, `Date`, `Map` | copied by reference | deep clone them too |
| Mutation | never | lodash `merge` mutates and returns the first argument |

Replacing arrays is usually what users expect from configs: overriding `plugins: ['b']` should not give `['b', …rest of defaults]` by index.

## Prototype pollution

`JSON.parse('{"__proto__": {"isAdmin": true}}')` creates an **own** property called `__proto__`. A naive merge then evaluates `target['__proto__']`, which is `Object.prototype`, sees a plain object on both sides, and recurses into it: every object in the app now has `isAdmin`. lodash, jQuery and Hoek all had CVEs for exactly this. Skipping `__proto__` (and arguably `constructor`/`prototype`) closes the hole.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `Object.assign({}, a, b)` / spread | Shallow: `b.theme` replaces `a.theme` entirely |
| Merging into the first argument | Callers' defaults object is mutated, so the second call starts from polluted defaults |
| `typeof x === 'object'` as "mergeable" | Arrays, `null` and `Date` get merged as objects |
| Assigning source objects by reference | Later merges mutate an input |
| No `__proto__` guard | Prototype pollution |

## Follow-ups interviewers ask

- **Array strategy option:** pass `{ arrays: 'concat' }` and branch in the "otherwise" case.
- **Cycles:** a `WeakMap<source, copy>` in `cloneData`, as in deep clone.
- **TypeScript:** a `DeepMerge<A, B>` mapped type that recursively overrides keys; good for discussing conditional types.
- **Immutability with structural sharing:** for Redux-like updates you'd rather reuse untouched branches from the base than copy everything. Trade-off: sharing means callers must not mutate the result.
