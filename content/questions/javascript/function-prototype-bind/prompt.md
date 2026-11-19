Implement `Function.prototype.myBind(thisArg, ...boundArgs)`, a polyfill for [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind). It returns a **new function** that, when called, invokes the original with `this` fixed to `thisArg` and `boundArgs` prepended to the call's own arguments.

The starter attaches the function to `Function.prototype` and default-exports it.

```js
const user = { name: 'Grace' };
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const hello = greet.myBind(user, 'Hello');
hello('!'); // 'Hello, Grace!'
hello.call({ name: 'Other' }, '?'); // 'Hello, Grace?' (bound `this` wins)

function Point(x, y) {
  this.x = x;
  this.y = y;
}
const AtOrigin = Point.myBind(null, 0);
const p = new AtOrigin(5); // Point { x: 0, y: 5 }
p instanceof Point; // true
p instanceof AtOrigin; // true
```

## Requirements

- Throw a `TypeError` if `myBind` is called on a non-function.
- Calling the bound function invokes the target with the bound `this` and `[...boundArgs, ...callArgs]`, and returns its result. `call`/`apply`/`bind` on the bound function cannot change `this`.
- **Calling with `new`:** the bound `this` is ignored. The target is constructed with the combined arguments, and the result is an instance of the target. `instance instanceof boundFn` is also `true`.
- Binding a bound function again keeps the **first** `this`, and the bound arguments accumulate.
- The bound function's `name` is `'bound ' + target.name`, and its `length` is the target's length minus the number of bound arguments (never below 0).
- You may use `Reflect.apply` and `Reflect.construct` (or `apply`) inside the bound function. Do **not** use the native `bind`.

## Follow-up

- Why does `this` get lost in `setTimeout(obj.method, 0)` or `<button onClick={this.handleClick}>`, and how does `bind` fix it?
- Arrow functions vs `bind`: what are the trade-offs?
