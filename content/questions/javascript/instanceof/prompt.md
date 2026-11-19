Implement `myInstanceOf(value, target)`, which returns the same result as `value instanceof target` **without using the `instanceof` operator**.

```js
class Animal {}
class Dog extends Animal {}
const rex = new Dog();

myInstanceOf(rex, Dog); // true
myInstanceOf(rex, Animal); // true
myInstanceOf(rex, Object); // true
myInstanceOf(rex, Array); // false
myInstanceOf(42, Number); // false (primitives are never instances)
myInstanceOf(Object.create(null), Object); // false
myInstanceOf(rex, {}); // throws TypeError
```

## Requirements

- If `target` is not an object, throw a `TypeError`. (Note that functions are objects.)
- If `target` has a custom `Symbol.hasInstance` method (one that is **not** the default inherited from `Function.prototype`), call it with `value` and return its result converted to a boolean.
- Otherwise, if `target` is not callable, throw a `TypeError`.
- Primitives (`null`, `undefined`, numbers, strings, …) return `false`.
- Otherwise read `target.prototype`. If it's not an object, throw a `TypeError`.
- Walk `value`'s prototype chain with `Object.getPrototypeOf` and return `true` if you reach `target.prototype`, or `false` if you reach `null`.

## Follow-up

- Why can `instanceof` give the "wrong" answer for arrays coming from an iframe? What should you use instead?
- How does `instanceof` behave with bound functions?
