## Approach

1. **Validate `proto`.** It must be `null` or an object/function. `objectCreate(undefined)` and `objectCreate(42)` throw `TypeError`, like the native method.
2. **Create the object with the right prototype.**
   - For a non-null `proto`, use the classic constructor trick: a throwaway function `F` with `F.prototype = proto`, then `new F()`. The `new` operator links the new object to `F.prototype`.
   - For `null`, the trick can't work, because `new F()` falls back to `Object.prototype` when `F.prototype` isn't an object. Create `{}` and call `Object.setPrototypeOf(obj, null)`.
3. **Apply descriptors.** If `propertiesObject !== undefined`, call `Object.defineProperties(obj, propertiesObject)`. That handles defaults (`writable`, `enumerable` and `configurable` default to `false`), accessors, and validation such as mixing `value` with `get`.

You could use `Object.setPrototypeOf` for both cases. Showing the constructor trick demonstrates that you know how `new` links prototypes, and it was the original Crockford-style `Object.create` shim.

## Complexity

O(1) to create the object, plus O(k) for k property descriptors.

## Edge cases

- **`propertiesObject` is `null`:** native `Object.create(proto, null)` throws a `TypeError` (from `ToObject(null)`), and `Object.defineProperties(obj, null)` throws the same way. Only `undefined` means "no properties".
- **Descriptor defaults:** `{ y: { value: 2 } }` creates a non-enumerable, read-only, non-configurable property. Assigning `point.y = 5` silently fails in sloppy mode and throws in strict mode.
- **Function `proto`:** allowed. The new object inherits `call`, `apply` and so on, but isn't callable itself.

## Common mistakes

- `if (!proto) throw` rejects `null`, which is valid.
- Using `obj.__proto__ = proto`. It's a legacy accessor, and on an object that already has a null prototype it's just an ordinary property, so it doesn't work.
- Copying `propertiesObject` with `Object.assign`. That treats descriptors as plain values: you'd get a property `x` whose value is `{ value: 1, enumerable: true }`.
- Allowing `undefined` as `proto` and silently defaulting to `Object.prototype`.

## The ES5 polyfill and its limits

```js
function create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```

Without `setPrototypeOf` (ES2015) or a writable `__proto__`, ES5 shims **couldn't support `null`**, and they couldn't implement real property descriptors in ES3 engines. Many shims threw for those cases rather than returning something subtly wrong.

## When to use `Object.create(null)`

- **Dictionaries keyed by user input.** A plain `{}` inherits `toString`, `constructor` and `__proto__`, so `counts['__proto__']++` or `'constructor' in obj` misbehave. A prototype-less object has no inherited keys and isn't vulnerable to prototype-pollution tricks through `__proto__`. In modern code, a `Map` is usually the better choice.
- **Prototypal inheritance without classes:** `const child = Object.create(parent)` is the simplest form of delegation, and it's what `class extends` does under the hood (`Child.prototype = Object.create(Parent.prototype)`).
