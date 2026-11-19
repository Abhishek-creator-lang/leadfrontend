Implement `compose(...fns)`. It returns a function that applies `fns` **from right to left**: the last function receives the original arguments, and every other function receives the return value of the function to its right.

`compose(f, g, h)(x)` is the same as `f(g(h(x)))`. This is the order used by mathematical composition and by helpers such as Redux's `compose` for store enhancers.

```js
const double = (n) => n * 2;
const increment = (n) => n + 1;
const sum = (a, b) => a + b;

compose(double, increment)(5); // 12  -> double(increment(5))
compose(increment, double)(5); // 11  -> increment(double(5))
compose(double, sum)(3, 4);    // 14  -> the rightmost function gets all arguments
compose()(7);                  // 7   -> no functions means identity
```

## Requirements

- The **rightmost** function receives all of the arguments passed to the composed function. Every other function receives a single value.
- With no functions, return an identity function that returns its **first** argument.
- `this` of the composed call is forwarded to every function.
- Composing must not call anything. Functions only run when the composed function is called, and the composed function can be called many times.

## Follow-up

- How would you write `pipe` (left to right) in terms of `compose`?
- How would you compose async functions that return promises?
- Why does Redux's `applyMiddleware` rely on composition?
