## Approach

Every array inherits from `Array.prototype`, so a function stored there is reachable as `arr.square()`. Inside it, `this` is the array the method was called on.

The body is a `map`-style loop:

1. Allocate `new Array(this.length)`, which starts as holes.
2. For each index that exists (`i in this`), write `this[i] * this[i]`.
3. Return the new array.

Using `this.map((x) => x * x)` is also perfectly acceptable in an interview and keeps holes for free. The explicit loop just shows you know *why* holes survive.

## The one real trap: `this`

```js
Array.prototype.square = () => this.map((x) => x * x); // broken
```

Arrow functions don't get their own `this`. They capture it from the surrounding scope, which in an ES module is `undefined`. The method must be a regular `function` (or a method shorthand) so that `this` is bound at call time.

## Complexity

O(n) time, O(n) space for the result.

## Edge cases

- **Empty array:** returns `[]`.
- **Non-numbers:** `'3' * '3'` is `9`. `'a' * 'a'` is `NaN`. `null * null` is `0`. That matches the `*` operator, which is what the prompt specifies.
- **BigInt:** `2n * 2n` is `4n`. The `*` operator handles it, but mixing BigInt and Number throws a `TypeError`.
- **Holes:** stay holes because we never write to those indices.

## Why patching built-ins is discouraged

- **Collisions with future standards.** This is the "smooshgate" story: MooTools added `Array.prototype.flatten`, which blocked TC39 from shipping a native `flatten` with different semantics. The standard method had to be renamed to `flat`.
- **Enumerability.** Plain assignment creates an *enumerable* property, so `for (const k in arr)` suddenly yields `'square'`.
- **Global side effects.** Every library in the page sees the change, and two libraries patching the same name will overwrite each other.

## Making it safer

```js
if (!Array.prototype.square) {
  Object.defineProperty(Array.prototype, 'square', {
    value: square,
    writable: true,
    configurable: true,
    enumerable: false,
  });
}
```

Better still, export a plain helper (`square(arr)`), or subclass (`class NumberList extends Array`) and keep the global prototype untouched.

## Follow-ups

- How would you make `square` work on typed arrays? (Attach it to `%TypedArray%.prototype`, reached via `Object.getPrototypeOf(Int8Array.prototype)`.)
- What does `[1, 2, 3].square().square()` return? (`[1, 16, 81]`, since it returns an array and so it chains.)
