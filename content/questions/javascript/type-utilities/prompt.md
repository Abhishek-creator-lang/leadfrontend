Implement a small set of type predicates for JavaScript's primitive types. Export each one by name, and export `isPrimitive` as the default.

```js
import isPrimitive, {
  isBoolean, isNumber, isString, isSymbol, isBigInt, isNull, isUndefined, isNil,
} from './index';

isNumber(42);            // true
isNumber(NaN);           // true   -> NaN is of type number
isNumber('42');          // false
isNull(null);            // true
isNil(undefined);        // true
isBoolean(new Boolean(false)); // false -> boxed objects are not primitives
isPrimitive({});         // false
isPrimitive(10n);        // true
```

## Requirements

Each function takes one value and returns a boolean.

| Function | Returns `true` for |
|---|---|
| `isBoolean` | `true` and `false` |
| `isNumber` | any primitive number, **including `NaN` and `±Infinity`** |
| `isString` | primitive strings |
| `isSymbol` | symbols |
| `isBigInt` | bigints |
| `isNull` | `null` only |
| `isUndefined` | `undefined` only |
| `isNil` | `null` or `undefined` |
| `isPrimitive` (default export) | any of the seven primitive types: string, number, bigint, boolean, symbol, undefined, null |

- **Boxed primitives** (`new Number(1)`, `new String('a')`, `Object(Symbol())`) are objects, so every predicate above returns `false` for them.
- `document.all` and other host oddities are out of scope.

## Follow-up

- Why does `typeof null` return `'object'`?
- How would you check for a *finite* number, or an integer?
- Why can't `x === undefined` always be trusted in very old code, and why is `typeof x === 'undefined'` still used for undeclared globals?
