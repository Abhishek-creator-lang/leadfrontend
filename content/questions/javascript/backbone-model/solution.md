## Approach

The class has two concerns. Keep them separate:

1. **State:** `_attributes` (current), `_previous` (a snapshot from before the last change) and `changed` (what that change touched).
2. **Events:** a minimal emitter (`Map<event, callback[]>`) with `on`, `off` and an internal `_trigger`.

### `set`, step by step

```js
set(key, value, options) {
  const [attrs, opts] = typeof key === 'object' ? [key, value || {}] : [{ [key]: value }, options || {}];
  const changes = Object.keys(attrs).filter((k) => !Object.is(this._attributes[k], attrs[k]));
  if (changes.length === 0) return this;            // no-op: no events, keep previous/changed

  this._previous = { ...this._attributes };          // snapshot BEFORE mutating
  this.changed = {};
  for (const k of changes) { this._attributes[k] = attrs[k]; this.changed[k] = attrs[k]; }

  if (!opts.silent) {
    for (const k of changes) this._trigger(`change:${k}`, this, this._attributes[k]);
    this._trigger('change', this);
  }
  return this;
}
```

Three details carry the design:

1. **Normalise the two call signatures** first, so the rest of the code handles one shape.
2. **Compute the diff before mutating.** That gives the no-op short-circuit and the list of keys to announce.
3. **Apply everything, then notify.** If `change:a` fired before `b` was updated, a listener reading `model.get('b')` would see a half-applied state. Batching mutation first is the "consistent snapshot" guarantee every state library has to provide.

`unset` is the same flow with a deletion: if the key exists, snapshot, `delete` it, record `changed[key] = undefined`, and trigger `change:key` with `undefined` followed by `change`.

### Defaults

`defaults()` is a **method** returning a fresh object, so each instance gets its own copy. If defaults were a shared object literal on the prototype, `defaults.tags.push('x')` on one instance would leak into every other instance. The constructor does `Object.assign({}, this.defaults?.(), attributes)` without firing events, since nobody can be listening yet.

### `Object.is` for equality

`===` treats `NaN` as unequal to itself, so `set('x', NaN)` would fire a change every time. `Object.is` handles `NaN` and distinguishes `+0`/`-0`. Backbone itself uses a **deep** equality check; a shallow check is cheaper and matches React's `useState` bail-out rule, but means setting a new-but-equal object fires a change.

## Complexity

`set` is O(k) for k keys plus the snapshot copy, O(n) for n attributes. The snapshot can be avoided by storing only the previous values of changed keys, which matters for very wide models.

## Edge cases

- `set({})` or same-value sets: nothing fires.
- `silent: true` still updates `previous` and `changed`.
- `unset` of a missing key: no-op.
- Listeners added during a trigger: iterate over a copy of the callback array, as with any emitter.
- Re-entrant `set` inside a `change` handler: here, it simply runs a nested change cycle. Backbone adds "pending" bookkeeping so that the outer `change` fires once with all changes; worth mentioning.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Firing `change:a` before applying `b` | Listeners observe inconsistent state |
| Snapshotting `previous` after mutation | `previous()` returns the new value |
| Shared defaults object | Instances share nested arrays and objects |
| `===` comparison | `NaN` always counts as a change |
| `toJSON` returning `this._attributes` | Callers can mutate the model's internals without events |

## Backbone vs React

Backbone models are **mutable and observable**: you mutate, the model tells listeners, views patch the DOM themselves. React flips this: state is **immutable**, you produce a new value, and React re-renders and diffs. The observable approach is efficient for small updates but in large apps leads to **cascading updates**: model A's change handler sets model B, whose handler sets A... and it becomes hard to know why a view changed. That pain motivated Flux's one-way data flow and Redux.

The idea is far from dead: MobX, Vue's reactivity, Ember's tracked properties and signals in Solid/Preact/Angular are fine-grained observables, but with automatic dependency tracking and batched, glitch-free updates.

## Follow-ups

- **Validation:** call `this.validate(nextAttrs)` before applying; if it returns an error, fire `invalid` and return `false` without changing anything.
- **Collections:** a `Collection` that forwards its models' events (`change` bubbles up as `change` on the collection).
- **Computed attributes:** listen to `change:first` and `change:last` to maintain `fullName`, or compute lazily in `get`.
- **`hasChanged(key)`** and `changedAttributes()`.
