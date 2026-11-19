## Approach

The bound arguments are fixed when `partial` is called. Each invocation builds a **fresh** argument array from them, so state never leaks between calls:

```js
let next = 0;
const finalArgs = boundArgs.map((arg) =>
  arg === partial.placeholder ? callArgs[next++] : arg
);
finalArgs.push(...callArgs.slice(next));
return func.apply(this, finalArgs);
```

`callArgs[next++]` naturally produces `undefined` once the call arguments run out, which matches the spec for unfilled holes. `slice(next)` appends whatever is left.

The returned function is a regular `function` so that `this` comes from the call site, for example `obj.method = partial(fn, 1)` followed by `obj.method()`.

## Complexity

O(b + c) per call, where b is the number of bound arguments and c the number of call arguments.

## Edge cases

- **No bound arguments:** behaves like `func` itself.
- **Too few call arguments:** holes become `undefined`. `func` still runs.
- **Placeholders in the call arguments** are passed through as values. Only placeholders in `boundArgs` are special.
- **`func.length`:** the returned function has length 0 because of rest parameters. If a library depends on `length` (for example to curry the result), you would need `Object.defineProperty(fn, 'length', …)`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Replacing placeholders in `boundArgs` in place | The second call sees the first call's values |
| `func.bind(null, ...boundArgs)` | Placeholders are not supported, and `this` is permanently `null` |
| Filling holes from the end | Wrong argument order |
| Waiting for all holes to be filled before calling | That's `curry`, not `partial` |

## Partial vs curry vs bind

- **`bind`** fixes `this` and leading arguments, and returns a function with an adjusted `length`. It also creates a *bound function* that can be used with `new`.
- **`partial`** fixes leading arguments (with holes), keeps `this` dynamic, and always calls.
- **`curry`** keeps collecting arguments until `func.length` is satisfied.

## Follow-ups

- **`partialRight`:** fill placeholders from the call arguments in order, but put the bound arguments *after* the remaining call arguments.
- **React event handlers:** `onClick={partial(handleSelect, item.id)}` creates a new function on every render, just like an inline arrow. Discuss when that matters (memoized children) and when it doesn't.
