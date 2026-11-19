## TL;DR

**Partial application** means taking a function of several arguments, **fixing some of them now**, and getting back a **new function that takes the rest**. `const addTax = (rate, price) => …; const addVat = partial(addTax, 0.2);` gives you `addVat(price)`. In JavaScript you do it with **closures** or **`Function.prototype.bind`**. It's a way to turn general functions into specific, reusable ones.

## The idea

```js
function request(method, baseUrl, path, body) {
  return fetch(baseUrl + path, { method, body: body && JSON.stringify(body) });
}

// fix the first two arguments
const postToApi = (path, body) => request('POST', 'https://api.example.com', path, body);

postToApi('/orders', { sku: 'A1' });
```

The original function stays general; the partially applied one carries some context with it.

## A generic `partial` helper

```js
function partial(fn, ...preset) {
  return function partiallyApplied(...later) {
    return fn.apply(this, [...preset, ...later]);
  };
}

const greet = (greeting, punctuation, name) => `${greeting}, ${name}${punctuation}`;
const hello = partial(greet, 'Hello', '!');
hello('Ada');   // 'Hello, Ada!'
hello('Linus'); // 'Hello, Linus!'
```

Note `fn.apply(this, …)`: forwarding `this` keeps the helper usable for methods.

## Built in: `bind`

```js
const hello2 = greet.bind(null, 'Hello', '!');
hello2('Grace'); // 'Hello, Grace!'
```

`bind` both fixes `this` (first argument) and partially applies the rest. Downsides: you must pass a `this` value even when you don't care, and the bound function's `length` shrinks accordingly (`hello2.length === 1`).

## Partially applying arguments other than the first

Plain partial application fixes **leading** arguments. To fix trailing ones, write a `partialRight`, or use placeholders, or (most readable) just use an arrow function:

```js
const parseDecimal = (s) => Number.parseInt(s, 10); // fixes the 2nd arg of parseInt
['1', '2', '3'].map(parseDecimal); // [1, 2, 3]
// vs the classic bug: ['1','2','3'].map(parseInt) → [1, NaN, NaN]
```

Lodash's `_.partial(fn, _, 'x')` supports placeholders for skipping positions.

## Where it shows up in real code

- **Event handlers with extra data**: `onClick={() => removeItem(id)}` is partial application by closure.
- **Configured utilities**: `const log = partial(logger, 'checkout')`, `const formatEUR = partial(formatMoney, 'EUR')`.
- **Dependency injection**: `const makeHandler = (db) => (req, res) => …` fixes infrastructure once at startup.
- **Array callbacks** where the callback signature doesn't match (`map` passes `(item, index, array)`).

## Pitfalls

- **Argument order matters**: functions designed for partial application put the most stable arguments (configuration) first and the data last.
- **Readability**: deeply nested partials can obscure what a function actually takes; name the results well.
- **Debugging**: stack traces show anonymous wrappers; naming the inner function helps.
- **New function per call**: creating partials inside render loops creates new identities (a React memoization concern), so hoist or memoize them when it matters.

## In an interview, mention…

- Fix some arguments now, supply the rest later, implemented with closures or `bind`.
- How it differs from currying: one step with any number of remaining arguments, versus a chain of unary functions.
- Data-last argument ordering and practical examples like configured loggers or API clients.
