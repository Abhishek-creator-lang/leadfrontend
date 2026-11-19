## TL;DR

JavaScript has **seven primitive types**: `string`, `number`, `bigint`, `boolean`, `undefined`, `null` and `symbol`. Everything else is an **object** (including arrays, functions, dates, maps and regexes). **Primitives are immutable and compared by value**; **objects are mutable and compared by reference**. `typeof` mostly reflects this, with famous quirks: `typeof null === 'object'` and `typeof function(){} === 'function'`.

## The primitives

```js
typeof 'hi'          // 'string'    UTF-16 code units, immutable
typeof 42            // 'number'    IEEE-754 double: 0.1 + 0.2 !== 0.3, NaN, ±Infinity, -0
typeof 2n            // 'bigint'    arbitrary-precision integers (2n ** 64n works)
typeof true          // 'boolean'
typeof undefined     // 'undefined' "no value assigned"
typeof null          // 'object'    historical bug; null means "intentionally empty"
typeof Symbol('id')  // 'symbol'    unique identifiers, often property keys
```

## Objects

```js
typeof {}             // 'object'
typeof []             // 'object'  → use Array.isArray
typeof new Date()     // 'object'
typeof (() => {})     // 'function' (a callable object)
typeof new Map()      // 'object'
```

To distinguish object kinds, use `Array.isArray`, `instanceof` (same realm only), or `Object.prototype.toString.call(x)` which yields `"[object Date]"` etc.

## Value vs reference

```js
let a = 'x'; let b = a; b += 'y';
console.log(a); // 'x'  primitives are copied

const o1 = { n: 1 }; const o2 = o1; o2.n = 2;
console.log(o1.n); // 2  both names point to the same object

({ n: 1 }) === ({ n: 1 }); // false, different references
```

Strictly speaking, JS always passes **by value**; for objects the value is a reference. That's why reassigning a parameter inside a function doesn't affect the caller, but mutating it does.

## Wrapper objects and autoboxing

`'abc'.toUpperCase()` works because the engine temporarily wraps the primitive in a `String` object. Never create wrappers yourself: `new Boolean(false)` is an object and therefore **truthy**.

## Number pitfalls worth knowing

```js
0.1 + 0.2 === 0.3                       // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // true
Number.MAX_SAFE_INTEGER                 // 9007199254740991 (2^53 - 1)
9007199254740993 === 9007199254740992   // true, precision lost
NaN === NaN                             // false → use Number.isNaN or Object.is
Object.is(-0, 0)                        // false, though -0 === 0
1n + 1                                  // TypeError: cannot mix BigInt and Number
```

Use `bigint` for IDs from back ends that exceed 2^53 (e.g. Twitter-style snowflake IDs). Note that `JSON.stringify` throws on bigints, so APIs usually send them as strings.

## Checking types robustly

| Check | Use |
|---|---|
| null | `x === null` |
| null or undefined | `x == null` (the one accepted use of `==`) |
| array | `Array.isArray(x)` |
| plain object | `Object.prototype.toString.call(x) === '[object Object]'` |
| real number | `Number.isFinite(x)` |
| NaN | `Number.isNaN(x)` |

## In an interview, mention…

- Seven primitives + objects, and the `typeof null` legacy quirk.
- Immutability of primitives, reference semantics of objects, and the consequences for equality and for React's shallow comparisons.
- Floating-point precision, safe integers and when to reach for `bigint`.
