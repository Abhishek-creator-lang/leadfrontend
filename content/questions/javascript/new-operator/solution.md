## Approach

For an ordinary function, `new F(...args)` does four things:

1. **Create** a fresh object.
2. **Link** its prototype to `F.prototype`, or to `Object.prototype` if `F.prototype` isn't an object.
3. **Run** `F` with `this` bound to the new object.
4. **Choose the result:** if `F` returned an object (including functions), use it. Otherwise use the new object.

```js
const proto = isObject(constructor.prototype) ? constructor.prototype : Object.prototype;
const instance = Object.create(proto);
const result = constructor.apply(instance, args);
return isObject(result) ? result : instance;
```

## Why the return-value rule?

It lets a constructor act as a factory: return a cached instance (a singleton), a proxy, or a different subtype. Primitives are ignored so that an accidental `return 0` or `return 'done'` doesn't replace the instance. Arrays, functions, `Date`s and other objects **do** replace it, so `return []` from a constructor gives the caller an array.

## Complexity

O(1) plus whatever the constructor does.

## Edge cases

- **Non-object `prototype`:** `F.prototype = null; myNew(F)` still produces an object that inherits from `Object.prototype`, exactly like `new F()`. The spec calls this `GetPrototypeFromConstructor` falling back to the realm's intrinsic.
- **Constructor returns `null`:** `null` isn't an object for this purpose (`typeof null === 'object'` is the classic trap), so the instance is returned.
- **Constructor throws:** the error propagates and the half-built instance is discarded.

## Limitations of a userland `new`

- **Classes:** class constructors throw `TypeError: Class constructor cannot be invoked without 'new'` when called through `apply`. Derived classes also expect `super()` to *create* `this`, which a pre-made object can't satisfy. `Reflect.construct(C, args)` is the only correct userland alternative.
- **`new.target`:** inside the constructor it's `undefined` when you call it through `apply`. Code that checks `if (!new.target) throw` (to enforce `new`) will reject `myNew`. `Reflect.construct` sets it.
- **Arrow functions and methods** have no `[[Construct]]`, so native `new` throws `TypeError`. `myNew` can't detect them reliably (no `prototype` is a hint, but bound functions also lack one and *are* constructible), so it would just call them. Mention it rather than pretending it's handled.
- **Built-ins with internal slots:** `myNew(Date)` returns a string, because `Date()` called as a function returns a string, not a date object. Exotic objects (arrays, dates, maps) get their internal slots only when created through real construction.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof result === 'object'` as the check | `null` returned as the result, and returned functions ignored |
| `obj.__proto__ = F.prototype` | Works, but relies on a legacy accessor |
| Forgetting the return-value rule | Factory constructors break |
| Returning `result \|\| instance` | Any truthy primitive replaces the instance |
| `F.call(instance, args)` | Passes the whole array as one argument |

## Follow-ups

- **`instanceof` connection:** `myNew(F) instanceof F` is true because step 2 linked the prototype. Change `F.prototype` afterwards and existing instances are no longer `instanceof F`.
- **Enforcing `new` in ES5 code:** `if (!(this instanceof F)) return new F(...arguments);` was the classic guard. Classes made it unnecessary.
