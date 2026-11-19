This follows on from Type Utilities, which covered primitives. Now implement checks for **non-primitive** values. Export `isPlainObject` as the default export and the others by name.

```js
import isPlainObject, { isArray, isFunction, isObject } from './index';

isArray([]); // true
isArray({ length: 0 }); // false

isFunction(() => {}); // true
isFunction(class A {}); // true
isFunction(async function () {}); // true

isObject({}); // true
isObject([]); // true
isObject(() => {}); // true
isObject(null); // false

isPlainObject({}); // true
isPlainObject(Object.create(null)); // true
isPlainObject(new Date()); // false
isPlainObject([]); // false
```

## Requirements

| Function | Returns `true` for |
|---|---|
| `isArray(value)` | real arrays only. Array-likes (`arguments`, `NodeList`, `{ length: 0 }`) and typed arrays are `false`. |
| `isFunction(value)` | anything callable: regular, arrow, async and generator functions, classes, bound functions. |
| `isObject(value)` | any non-primitive: objects, arrays, functions, dates, maps, class instances… but **not** `null`. |
| `isPlainObject(value)` | objects whose prototype is exactly `Object.prototype` **or** `null` (object literals, `new Object()`, `Object.create(null)`). Arrays, functions, class instances, `Date`s, `Map`s and objects created with `Object.create(someOtherObject)` are `false`. |

All four return `false` for every primitive, including `null` and `undefined`.

## Follow-up

- Why is `typeof null === 'object'`, and why does `isObject` have to handle it?
- Why is `value instanceof Array` unreliable, and when exactly does it fail?
- Deep-clone and deep-merge utilities rely on `isPlainObject`. Why not just `isObject`?
