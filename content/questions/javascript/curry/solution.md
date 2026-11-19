## Approach

Write the curried function as a recursive closure over the arguments collected so far:

```js
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) return func.apply(this, args);
    return function (...more) {
      return curried.apply(this, [...args, ...more]);
    };
  };
}
```

How it works:

1. `curried` is called with everything collected so far.
2. If that's enough, it calls `func` right away, forwarding `this` and every argument.
3. Otherwise it returns a new function. When called, that function re-enters `curried` with the old and new arguments **combined into a new array**.

Creating a new array on every step (`[...args, ...more]`) is what makes partial functions reusable. If you pushed into a shared array instead, `base(3)` and `base(5)` would append to the same list, and the second call would see stale arguments.

`func.length >= 0` also covers the zero-arity case for free: `0 >= 0`, so the first call invokes `func` immediately.

## `this` handling

Both inner functions are regular `function`s and use `apply(this, …)`, so the `this` of the **final** call reaches `func`. Arrow functions would capture `this` from `curry`'s scope, which is never what the caller meant. In practice, curried methods are rare, but interviewers like to check that you thought about it.

## Complexity

Each call copies the collected arguments: O(k) for k arguments so far, so currying a function of arity n one argument at a time costs O(n²) copying in total. For realistic arities (2 to 5), that's negligible.

## Edge cases

- Extra arguments in the final call are passed through: `curried(1, 2, 3, 4)` calls `func(1, 2, 3, 4)`.
- Empty calls `curried()()` don't consume anything.
- Default and rest parameters reduce `func.length`, so `curry((a, b = 1) => a + b)` invokes after one argument.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Mutating a shared `args` array with `push` | Reusing a partial (`base(3)`, then `base(5)`) gives wrong results |
| Checking `===` instead of `>=` | Extra arguments in one call make it never invoke |
| Arrow functions plus `func(...args)` | `this` is lost for method usage |
| Using `arguments.callee` | Throws in strict mode (and modules are always strict) |
| Hard-coding three levels of nesting | Only works for one arity |

## Follow-ups interviewers ask

- **Explicit arity:** `curry(func, arity = func.length)`. lodash supports this, and it's the only way to curry variadic functions.
- **When currying helps:** building specialised helpers from general ones (`const getById = curry(getBy)('id')`), point-free pipelines with `compose`/`pipe`, and event handlers that need extra data (`onClick={select(id)}`). It hurts when stack traces and TypeScript inference become harder to read, or when teammates aren't used to the style.
- **Placeholders:** let callers skip positions (`curried(_, 2)(1)`). That's Curry II.
- **`fn.length` on the result:** the curried function reports `0`. A polished version sets it with `Object.defineProperty(fn, 'length', { value: remaining })` so curried functions compose.
