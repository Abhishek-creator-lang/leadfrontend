Implement `objectCreate(proto, propertiesObject)`, which behaves like [`Object.create`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create). It returns a new, empty object whose prototype is `proto`, optionally with properties defined from `propertiesObject`.

```js
const animal = {
  speak() {
    return `${this.name} makes a sound`;
  },
};

const dog = objectCreate(animal);
dog.name = 'Rex';
dog.speak(); // 'Rex makes a sound'
Object.getPrototypeOf(dog) === animal; // true

const dict = objectCreate(null); // no prototype at all
'toString' in dict; // false

const point = objectCreate(Object.prototype, {
  x: { value: 1, enumerable: true },
  y: { value: 2 }, // non-enumerable, non-writable by default
});
Object.keys(point); // ['x']
```

## Requirements

- Do not use `Object.create`.
- `proto` must be an object, a function, or `null`. Anything else throws a `TypeError`.
- `objectCreate(null)` returns an object with **no** prototype.
- If `propertiesObject` is provided and not `undefined`, define its own enumerable properties as **property descriptors** on the new object, exactly like `Object.defineProperties`. You may use `Object.defineProperties` and `Object.setPrototypeOf`.

## Follow-up

- How did ES5-era polyfills implement this without `Object.setPrototypeOf`, and what couldn't they support?
- When would you reach for `Object.create(null)` in real code?
