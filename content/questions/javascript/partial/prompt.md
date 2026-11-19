Implement `partial(func, ...boundArgs)`. It returns a function that calls `func` with `boundArgs` followed by whatever arguments it receives. Unlike `Function.prototype.bind`, it does not fix `this`, and it supports a **placeholder** (`partial.placeholder`) that leaves a position to be filled at call time.

```js
const _ = partial.placeholder;
const greet = (greeting, name, punctuation) => `${greeting}, ${name}${punctuation}`;

const hello = partial(greet, 'Hello');
hello('Ada', '!'); // 'Hello, Ada!'

const askAda = partial(greet, _, 'Ada');
askAda('Hi', '?'); // 'Hi, Ada?'   -> 'Hi' fills the hole, '?' is appended
```

## Signature

```js
partial(func: Function, ...boundArgs: any[]): Function
partial.placeholder: symbol
```

## Requirements

- When the returned function is called, build the final argument list:
  1. Walk `boundArgs`. Each placeholder is replaced by the **next** call argument, left to right.
  2. Append any call arguments left over.
  3. If there are fewer call arguments than placeholders, the unfilled positions become `undefined`.
- `func` is **always** called on each invocation. Unlike currying, it never waits for more arguments.
- The returned function forwards its own `this` to `func`.
- It is reusable: each call starts from the original `boundArgs`.

## Follow-up

- How would you implement `partialRight`, which binds arguments to the end of the list?
- Why can't `bind` be used here if `this` should stay dynamic?
- How does this differ from `curry`?
