Implement `omit(object, keys)`. It returns a **new** object containing every own enumerable property of `object` **except** the ones listed in `keys`.

In React code you see this constantly when forwarding props: strip the props your component consumes and pass the rest to the DOM element.

```js
const props = { variant: 'primary', size: 'lg', onClick: fn, 'aria-label': 'Save' };

omit(props, ['variant', 'size']);
// { onClick: fn, 'aria-label': 'Save' }

omit({ a: 1, b: 2 }, ['c']); // { a: 1, b: 2 }
omit({ a: 1 }, []);          // { a: 1 } (a copy, not the same object)
```

## Signature

```js
omit(object, keys) // keys: Array<string>
```

## Requirements

- Copy **own enumerable string keys** (what `Object.keys` returns). Inherited properties and symbol keys are not copied. (lodash's `omit` also copies inherited and symbol-keyed properties; we keep it simpler.)
- Only **top-level** keys are omitted; `'a.b'` is a literal key name. (See `deep-omit` for nested removal.)
- Always return a new object, even when nothing is omitted. Never mutate the input.
- The copy is shallow.
- `null`/`undefined` input returns `{}`.
- Aim for O(n + k), not O(n × k), for n object keys and k omitted keys.

## Follow-up

- How does the object rest syntax (`const { a, ...rest } = obj`) compare? When can't you use it?
- Why is `pick` often safer than `omit` for data leaving your system?
