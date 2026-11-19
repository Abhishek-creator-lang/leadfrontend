Implement `Function.prototype.myApply(thisArg, argsArray)`, a polyfill for [`Function.prototype.apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply). It invokes the function with `this` set to `thisArg` and the elements of `argsArray` as the arguments, and returns the result.

The starter attaches the function to `Function.prototype` and default-exports it.

```js
function total(a, b, c) {
  return this.base + a + b + c;
}

total.myApply({ base: 10 }, [1, 2, 3]); // 16
Math.max.myApply(null, [4, 9, 2]); // 9
total.myApply({ base: 0 }, { length: 3, 0: 1, 1: 1, 2: 1 }); // 3 (array-likes work)
```

## Requirements

- **Do not** use `call`, `apply`, `bind` or `Reflect.apply`.
- `argsArray` may be `null` or `undefined`, which means "no arguments".
- Otherwise `argsArray` must be an **object**. Read its `length` and indices `0..length-1` (holes read as `undefined`). Throw a `TypeError` for primitives such as numbers or strings, as the native method does.
- Throw a `TypeError` if `myApply` is invoked on something that is not a function.
- `thisArg` follows the same rules as the `myCall` exercise: primitives are boxed, and `null`/`undefined` becomes `globalThis`. Any temporary property must not collide with existing keys and must be cleaned up even if the function throws.

## Follow-up

- Why was `fn.apply(null, arr)` so common before ES2015, and what replaced it?
- Is there a limit to how many arguments you can pass with `apply` or spread?
