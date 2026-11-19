## Approach

`bind` returns a closure that remembers three things: the **target** function, the **bound `this`**, and the **bound arguments**. The tricky part is that the closure can be invoked in two ways, and `new.target` tells them apart:

```js
function bound(...args) {
  const finalArgs = [...boundArgs, ...args];
  if (new.target !== undefined) {
    // `new bound(...)`: ignore thisArg and construct the target instead
    const newTarget = new.target === bound ? target : new.target;
    return Reflect.construct(target, finalArgs, newTarget);
  }
  return Reflect.apply(target, thisArg, finalArgs);
}
```

### Why `new.target === bound ? target : new.target`?

The spec says a bound function's `[[Construct]]` forwards `newTarget` unchanged, **except** when it is the bound function itself, in which case it substitutes the target. That makes `new Bound()` create an object whose prototype is `target.prototype`. It also keeps subclassing correct: with `class Sub extends Bound {}`, `new.target` is `Sub`, so the instance gets `Sub.prototype`.

### Making `instanceof` work

Native bound functions have no `prototype` property. `x instanceof boundFn` is defined to check `x instanceof target` instead. Our closure is an ordinary function with its own `prototype` object, so `instanceof` would wrongly return `false`. Defining `Symbol.hasInstance` on the bound function restores the spec behaviour:

```js
Object.defineProperty(bound, Symbol.hasInstance, {
  value: (instance) => instance instanceof target,
});
```

It must be defined with `defineProperty`. `Function.prototype[Symbol.hasInstance]` is non-writable, so plain assignment fails.

### `name` and `length`

These properties are non-writable but configurable, so set them with `Object.defineProperty`. `length` is `max(0, target.length - boundArgs.length)`. Libraries such as curry helpers rely on it.

## Complexity

O(1) to create the bound function. Each call costs O(b + n) to concatenate the bound arguments b and the call's arguments n.

## Edge cases

- **`call`/`apply` on the bound function:** they can't override `this`. The closure ignores its own `this` in the non-`new` branch.
- **Double binding:** `f.bind(a).bind(b)()` runs with `this === a`. The outer bind's `thisArg` is ignored because the inner bound function never reads its own `this`. Arguments accumulate in order.
- **Constructors returning objects:** `Reflect.construct` honours a constructor that returns its own object, just like `new`.
- **Non-constructible targets** (arrow functions, methods): `new` on the bound function throws a `TypeError` from `Reflect.construct`, which matches native behaviour.
- **Classes:** `Reflect.apply` on a class throws "Class constructor cannot be invoked without 'new'", which is also native behaviour.

## Common mistakes

- **Returning an arrow function.** It can't be used with `new` and has no `new.target`.
- **Using `this instanceof bound`** to detect `new`. That is the classic ES5 polyfill check. It gives false positives (`bound.call(Object.create(bound.prototype))`) and doesn't support subclassing. `new.target` is exact.
- **Forgetting to return** the target's result.
- **Calling `target.apply(...)`.** It breaks if `target` has an own `apply` property. `Reflect.apply` is robust.
- **Ignoring the call-time arguments** (`target.apply(thisArg, boundArgs)`), which breaks partial application.

## Follow-ups

- **Losing `this`:** `setTimeout(obj.method)` passes the function value without the object, so the call is a plain function call and `this` is `undefined` in strict mode. `bind`, a wrapper arrow `() => obj.method()`, or a class field arrow (`handleClick = () => {}`) all fix it.
- **Arrow vs bind:** class field arrows create one function **per instance**, they aren't on the prototype (so they can't be overridden or mocked via the prototype), and they're hard to spy on in tests. `bind` in the constructor has the same per-instance cost. Neither is a problem until you have thousands of instances.
- **React:** with function components and hooks this whole problem mostly disappears. `useCallback` is about referential stability, not `this`.
