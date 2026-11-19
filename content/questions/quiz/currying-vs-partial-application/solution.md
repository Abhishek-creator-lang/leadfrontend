## TL;DR

**Currying** transforms an n-ary function into a **chain of unary functions**: `f(a, b, c)` becomes `f(a)(b)(c)`. It's a change of *shape*, and doesn't supply any values itself. **Partial application** **supplies some arguments now** and returns a function expecting **all the remaining ones** in one call: `g = partial(f, a)` then `g(b, c)`. Calling a curried function with one argument *is* a partial application, which is why the terms get mixed up.

## Side by side

```js
const volume = (l, w, h) => l * w * h;

// Currying: reshape into unary steps
const curriedVolume = (l) => (w) => (h) => l * w * h;
curriedVolume(2)(3)(4); // 24

// Partial application: fix some args, take the rest together
const partial = (fn, ...preset) => (...rest) => fn(...preset, ...rest);
const volumeOfLength2 = partial(volume, 2);
volumeOfLength2(3, 4); // 24
```

| | Currying | Partial application |
|---|---|---|
| What it does | Converts `f(a,b,c)` to `f(a)(b)(c)` | Pre-fills some args of `f` |
| Result arity | Always unary functions, one per argument | Function taking the *remaining* args at once |
| Number of steps | As many as the arguments | Usually one |
| Needs to know arity? | Yes (to know when to call `f`) | No |
| JS built-in | None | `Function.prototype.bind` |

## A generic auto-curry

Practical `curry` helpers in JS are "loose": they accept one *or more* arguments per call, and invoke the original once enough arguments have arrived.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

const cv = curry(volume);
cv(2)(3)(4); // 24
cv(2, 3)(4); // 24
cv(2)(3, 4); // 24
```

This relies on `fn.length`, which ignores parameters with defaults and rest parameters:

```js
((a, b = 1) => 0).length; // 1
((...xs) => 0).length;    // 0, so auto-curry can't work on variadic functions
```

## How they relate

- Currying is a **transformation of a function**, done once.
- Partial application is an **act of supplying arguments**, done many times.
- Each step of calling a curried function partially applies it. Conversely, you can partially apply a function that was never curried (e.g. with `bind`).

## When to reach for which

- **Partial application**: you have an existing multi-arg function and want a specialised version (`const logError = log.bind(null, 'error')`). Simple, no special helpers needed.
- **Currying**: you're designing small composable functions for pipelines (`map(fn)`, `filter(pred)`, `propEq(key)(value)`), or an API where configuration arrives in stages (Redux middleware: `store => next => action`).

In everyday JavaScript, hand-written curried arrow functions (`(field) => (event) => …`) are more common and easier to type in TypeScript than generic `curry` utilities.

## Pitfalls

- Generic auto-curry plus optional parameters leads to functions being invoked too early or never.
- `this` handling: arrow-based helpers drop dynamic `this`; use `function` and `apply(this, …)` if methods matter.
- Over-currying hurts readability; `f(a)(b)(c)(d)` with unnamed intermediates is hard to follow.

## In an interview, mention…

- One-line definitions of both and the "curried call = partial application" relationship.
- `bind` as built-in partial application; implement `curry` using `fn.length`.
- Arity caveats (defaults, rest parameters) and where each is idiomatic.
