## TL;DR

TypeScript uses **structural typing**: compatibility is decided by **shape**, not by name or declaration. A value is assignable to a type if it has **at least the required members with compatible types**, regardless of which interface or class it was declared as. This matches how JavaScript code is actually written (duck typing) and makes interop easy. The trade-offs: **types with the same shape are interchangeable** even when they mean different things (`UserId` vs `OrderId` strings), and **extra properties are allowed** except in the special case of fresh object literals (excess property checks). When you need nominal behaviour, use **branded types** or classes with `private`/`#private` members.

## Shape-based compatibility

```ts
interface Point { x: number; y: number }
class Vector { constructor(public x: number, public y: number) {} }

const p: Point = new Vector(1, 2);      // OK: same shape, no relation declared

function len(p: Point) { return Math.hypot(p.x, p.y); }
const pos3d = { x: 1, y: 2, z: 3 };
len(pos3d); // OK: has x and y
```

Contrast with nominal languages (Java, C#), where `Vector` must explicitly `implements Point`.

## Excess property checks: the exception for fresh literals

```ts
len({ x: 1, y: 2, z: 3 }); // error: object literal may only specify known properties
```

When an **object literal is passed or assigned directly**, TypeScript flags unknown properties, because they're likely typos. Assign it to a variable first and the check no longer applies (the "freshness" is lost).

## Where structural typing surprises people

**Same shape, different meaning**

```ts
type UserId = string;
type OrderId = string;
function cancelOrder(id: OrderId) {}
const userId: UserId = 'u_1';
cancelOrder(userId); // compiles: both are just string
```

Fix with branding:

```ts
type OrderId = string & { readonly __brand: 'OrderId' };
```

**Classes are structural too**

```ts
class Cat { name = '' }
class Dog { name = '' }
const c: Cat = new Dog(); // OK
```

Adding a `private` or `#private` member makes a class effectively nominal, because private members are only compatible with the same declaration.

**Empty types accept almost anything**

`interface Empty {}` or `{}` matches every non-nullish value, because there are no required members.

**Functions:** a function with fewer parameters is assignable to one that expects more (`arr.forEach(x => …)` ignores index and array arguments). Return types are compared covariantly, and parameters contravariantly under `strictFunctionTypes`.

## Benefits

- Works naturally with JavaScript object literals, JSON and duck-typed libraries.
- Easy mocking in tests: any object with the right shape works.
- Loose coupling: modules don't need to share type declarations to interoperate.

## Consequences for API design

- Types describe **minimum requirements**, so accept the narrowest shape you need (`Pick<User, 'id'>`), which makes functions more reusable.
- `Object.keys(obj)` is typed `string[]` because objects may have more keys at runtime than their type declares.
- Runtime checks (`instanceof`) and compile-time compatibility can disagree. A structurally compatible object fails `instanceof`.

## In an interview, mention…

- Compatibility by shape, and how that differs from nominal typing.
- Excess property checks on fresh object literals as the exception.
- Pitfalls (interchangeable aliases, empty types, `Object.keys`), plus branding or private members for nominal behaviour.
- Benefits for JS interop and testing.
