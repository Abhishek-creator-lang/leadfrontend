Implement `pipe(...fns)`. It returns a function that passes its input through `fns` **from left to right**: the first function receives the original arguments, and each later function receives the previous function's return value.

`pipe(f, g, h)(x)` is the same as `h(g(f(x)))`. Data flows in reading order, which is why pipelines are popular for data transformation (see also the TC39 pipeline operator proposal).

```js
const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const slugify = (s) => s.replace(/\s+/g, '-');

const toSlug = pipe(trim, lower, slugify);
toSlug('  Hello Big World ');      // 'hello-big-world'

pipe((a, b) => a * b, String)(3, 4); // '12'  -> the first function gets all arguments
pipe()('x');                         // 'x'   -> identity
```

## Requirements

- The **first** function receives all of the arguments passed to the piped function. Every later function receives a single value.
- With no functions, return an identity function that returns its **first** argument.
- `this` of the piped call is forwarded to every function.
- Creating the pipeline must not call anything, and the pipeline can be called many times.
- Throw a `TypeError` **when `pipe` is called** if any argument is not a function.

## Follow-up

- Write an async version where each step may return a promise.
- How would you add a debugging "tap" step that logs a value without changing it?
- How do `pipe` and `compose` relate to each other?
