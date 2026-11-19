Implement `myNew(constructor, ...args)`, which does what `new constructor(...args)` does for ordinary **function** constructors, without using the `new` keyword or `Reflect.construct`.

```js
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

const ada = myNew(Person, 'Ada');
ada.name; // 'Ada'
ada.greet(); // "Hi, I'm Ada"
ada instanceof Person; // true

function Factory() {
  this.ignored = true;
  return { custom: true };
}
myNew(Factory); // { custom: true } (an object returned by the constructor wins)
```

## Requirements

- Throw a `TypeError` if `constructor` is not a function.
- Create a new object whose prototype is `constructor.prototype`. If `constructor.prototype` is not an object (someone set it to a primitive or `null`), use `Object.prototype`, as the spec does.
- Call `constructor` with `this` set to the new object and the given arguments.
- If the constructor returns an **object or function**, return that. Otherwise (no return, or a primitive), return the new object.
- You may use `Object.create` (or `Object.setPrototypeOf`) and `apply`/`call`.

## Clarification

`class` constructors can't be called without `new`, so `myNew` only needs to support ordinary functions. Explain in your answer why classes are out of reach and what would handle them.

## Follow-up

- What is `new.target`, and why can't `myNew` set it?
- What happens with `new` on an arrow function?
