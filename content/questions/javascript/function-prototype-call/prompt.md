Implement `Function.prototype.myCall(thisArg, ...args)`, a polyfill for [`Function.prototype.call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call). It invokes the function with `this` set to `thisArg` and the remaining arguments passed individually, and returns the function's result.

The starter attaches the function to `Function.prototype` and default-exports it.

```js
function describe(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

describe.myCall({ name: 'Ada' }, 'Hello', '!'); // 'Hello, Ada!'

function add(a, b) {
  return a + b;
}
add.myCall(null, 2, 3); // 5
```

## Requirements

- **Do not** use `call`, `apply`, `bind` or `Reflect.apply`. The point is to make the engine set `this` for you through a **method call** (`obj.fn()`).
- Throw a `TypeError` if `myCall` is invoked on something that is not a function.
- Primitive `thisArg` values are wrapped in their object form (so `this.toFixed` works when `thisArg` is `2`). A `null` or `undefined` `thisArg` means `globalThis`.
- Any temporary property you add to `thisArg` must not collide with existing properties and must be removed afterwards, **even if the function throws**.
- Errors thrown by the function propagate to the caller.

## Clarification

The native `call` passes primitives and `null`/`undefined` through untouched to **strict-mode** functions. A userland polyfill can't do that with the method-call trick, so the boxing and `globalThis` rules above describe the sloppy-mode behaviour, which is what this exercise targets. Explain the limitation in your answer.

## Follow-up

- What happens if `thisArg` is a frozen object?
- How is `call` different from `apply` and `bind`?
