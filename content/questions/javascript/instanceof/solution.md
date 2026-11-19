## Approach

The spec splits `instanceof` into two layers, and the solution mirrors them.

### 1. `InstanceofOperator(value, target)`

- `target` must be an object, otherwise `TypeError`.
- Look up `target[Symbol.hasInstance]`. Every function inherits a default implementation from `Function.prototype`. If the method found is something **else** (a `static [Symbol.hasInstance]` on a class, or a plain object with that method), call it with `this = target` and return the result as a boolean.
- Otherwise `target` must be callable, then run the ordinary algorithm.

Comparing against `Function.prototype[Symbol.hasInstance]` lets us reuse the "default" path without calling the native method, which would just be `instanceof` again.

### 2. `OrdinaryHasInstance(target, value)`

```js
if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
const proto = target.prototype;
if (proto === null || (typeof proto !== 'object' && typeof proto !== 'function')) throw new TypeError(...);
let current = Object.getPrototypeOf(value);
while (current !== null) {
  if (current === proto) return true;
  current = Object.getPrototypeOf(current);
}
return false;
```

The check starts at value's **prototype**, not at value itself. `Foo.prototype instanceof Foo` is `false`.

## Complexity

O(d) time, where d is the depth of the prototype chain. O(1) space.

## Edge cases

- **Primitives:** `42 instanceof Number` is `false`. `new Number(42) instanceof Number` is `true`. No boxing happens.
- **`Object.create(null)`:** the chain is just `null`, so it isn't even an instance of `Object`.
- **Changing the chain later:** `Object.setPrototypeOf(obj, Other.prototype)` or reassigning `Foo.prototype` changes the result, because `instanceof` checks *current* links, not how the object was created.
- **Arrow functions:** callable, but they have no `prototype`. If `value` is an object, reading `undefined` as the prototype throws a `TypeError`, matching native behaviour.
- **Proxies:** `Object.getPrototypeOf` triggers the `getPrototypeOf` trap, same as the native operator.

## Common mistakes

- Using `value.__proto__`. It's a legacy accessor on `Object.prototype`, so it doesn't exist on null-prototype objects and can be shadowed. Use `Object.getPrototypeOf`.
- Comparing `value.constructor === target`. That only checks one level, and `constructor` is just a writable property.
- Starting the loop at `value` instead of its prototype.
- Boxing primitives (`Object(value)`), which makes `42` look like an instance of `Number`.
- Forgetting `Symbol.hasInstance`.

## Follow-ups

- **Cross-realm objects:** an array created in an iframe has the iframe's `Array.prototype` in its chain, so `iframeArr instanceof Array` is `false`. Use `Array.isArray`, which checks the internal array-ness. For other types, use brand checks such as `Object.prototype.toString.call(x)`, or a library's own `isX` helpers.
- **Bound functions:** they have no `prototype`. The spec special-cases them: `x instanceof boundFn` checks `x instanceof targetFn`. A userland polyfill can't detect bound functions directly. The `function-prototype-bind` solution emulates the behaviour through `Symbol.hasInstance`.
- **`isPrototypeOf`:** `Dog.prototype.isPrototypeOf(rex)` is the same chain walk without the `Symbol.hasInstance` and callability rules, and it works for objects that aren't constructors (`Object.create(proto)` patterns).
