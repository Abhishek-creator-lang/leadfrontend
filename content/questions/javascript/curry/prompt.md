Implement `curry(func)`. It returns a curried version of `func` that collects arguments over any number of calls. As soon as it has collected at least `func.length` arguments, it calls `func` with all of them and returns the result. Until then, each call returns another function that waits for more.

```js
function volume(length, width, height) {
  return length * width * height;
}

const curried = curry(volume);

curried(2, 3, 4); // 24
curried(2)(3)(4); // 24
curried(2, 3)(4); // 24
curried(2)(3, 4); // 24

const base = curried(2);
base(3)(4); // 24
base(5)(1); // 10  (base is reusable; calls don't affect each other)
```

## Requirements

- The arity is `func.length` (the number of declared parameters before the first default or rest parameter).
- Each call may pass any number of arguments, including zero. A call with no arguments returns a function that still waits for the same arguments.
- When the total number of collected arguments reaches the arity, call `func` with **all** collected arguments, including any extras beyond the arity.
- Partially applied functions are **reusable**: calling one twice with different arguments must give independent results.
- `this` from the final call is forwarded to `func`, so a curried function can be used as a method.
- If `func.length` is `0`, calling the curried function invokes `func` immediately.

## Follow-up

- `func.length` is `0` for `(...args) => {}` and `1` for `(a, b = 2) => {}`. How would you let callers pass an explicit arity?
- Where does currying actually help in front-end code, and where does it hurt readability?
- How would you support placeholders (see Curry II)?
