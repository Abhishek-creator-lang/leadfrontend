## Approach

`apply` is `call` with a different argument format, so the solution has two parts.

### 1. Build the argument list (`CreateListFromArrayLike`)

- `argsArray == null` gives an empty list.
- If `argsArray` is not an object (`typeof` is neither `'object'` nor `'function'`), throw a `TypeError`. **Strings are rejected too**, even though they have a `length`. `Math.max.apply(null, '123')` throws natively.
- Otherwise read `length` once, clamp it to a valid length, and copy `argsArray[i]` for each index. A hole simply reads as `undefined`, so `fn.apply(null, [1, , 3])` passes three arguments.

### 2. Invoke with the right `this`

Use the same method-call trick as `call`:

```js
const context = thisArg == null ? globalThis : Object(thisArg);
const key = Symbol('myApply');
Object.defineProperty(context, key, { value: fn, configurable: true });
try {
  return context[key](...args);
} finally {
  delete context[key];
}
```

A `Symbol` key cannot collide with user properties, and `finally` makes sure the key is removed when `fn` throws.

## Complexity

O(n) to copy n arguments, then O(1) overhead for the call.

## Edge cases

- **Array-likes:** `arguments`, `{ length: 2, 0: 'a', 1: 'b' }` and typed arrays all work. It is a length-plus-index read, not iteration, so a `Set` passes **zero** arguments, because it has no `length`.
- **Primitive `argsArray`:** `TypeError`. This catches a common bug where someone passes a single value instead of an array.
- **`length` that isn't a number:** `{ length: '2', 0: 'a', 1: 'b' }` is converted to 2.
- **Limitations of the trick:** strict-mode functions see a boxed primitive or `globalThis` instead of the raw value, and frozen `thisArg` objects can't receive the temporary key. Mention these, as for `call`.

## Common mistakes

- **Spreading `argsArray` directly** (`fn(...argsArray)`). Spread uses the iterator protocol, so array-likes without `Symbol.iterator` throw, and `Set`s are spread when they shouldn't be.
- **`argsArray || []`.** It accepts `0`, `''` and `false` silently instead of throwing for non-objects.
- **String keys** for the temporary property, and missing `finally` cleanup.
- **Building a code string for `eval`/`new Function`** to pass the arguments. That was an old ES3 polyfill technique. It's slow and unsafe, and rest/spread makes it unnecessary.

## Follow-ups

- **Why `apply` was everywhere:** before spread syntax, `Math.max.apply(null, numbers)` and `Array.prototype.push.apply(a, b)` were the only ways to pass an array as separate arguments. Today `Math.max(...numbers)` and `a.push(...b)` do the same thing.
- **Argument limits:** engines cap the number of arguments, typically somewhere in the tens to hundreds of thousands depending on the engine and stack size. `Math.max(...hugeArray)` can throw `RangeError: Maximum call stack size exceeded`. For large arrays, use a loop or `reduce`.
- **`Reflect.apply(fn, thisArg, args)`** is the modern, robust form. It always throws for a missing `args`, and it isn't affected by someone overwriting `fn.apply`.
