## TL;DR

Branded (nominal or "opaque") types add a **phantom marker** to a type so that **structurally identical values aren't interchangeable**: `type UserId = string & { readonly __brand: 'UserId' }`. A plain `string` (or an `OrderId`) can no longer be passed where a `UserId` is expected. Values get the brand only through a **constructor or validation function** (often the single place that casts), so the brand also means **"this value has been checked"** (`Email`, `PositiveInt`, `SanitizedHtml`). At runtime it's still just a string, so there's zero cost.

## The problem

```ts
function chargeOrder(orderId: string, userId: string) {}
chargeOrder(user.id, order.id); // swapped arguments: compiles fine
```

## Branding

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

const UserId = (raw: string) => raw as UserId;   // the only cast, in one place
const OrderId = (raw: string) => raw as OrderId;

function chargeOrder(orderId: OrderId, userId: UserId) {}

const u = UserId('u_1');
const o = OrderId('o_9');
chargeOrder(o, u);      // OK
chargeOrder(u, o);      // error: UserId is not assignable to OrderId
chargeOrder('o_9', u);  // error: string is not assignable to OrderId
```

Using a `unique symbol` key (declared but never created) keeps the brand from appearing in autocomplete as a real property and prevents accidental collisions. A simpler `{ __brand: 'UserId' }` works too.

Branded values are still assignable **to** the base type (`const s: string = u;` is OK), so they work with any string API.

## Validation brands ("parse, don't validate")

```ts
type Email = Brand<string, 'Email'>;

function parseEmail(input: string): Email | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? (input as Email) : null;
}

function sendWelcome(to: Email) { /* no need to re-validate */ }

const email = parseEmail(form.email);
if (email) sendWelcome(email);
sendWelcome(form.email); // error: must go through parseEmail
```

Other useful brands: `PositiveInt`, `Cents` vs `Dollars`, `Iso8601`, `SafeHtml`, `AbsolutePath`, `Celsius` vs `Fahrenheit`.

## With schema libraries

Zod (`z.string().uuid().brand<'UserId'>()`), Valibot and Effect Schema can produce branded types from runtime validation. This is a clean way to brand IDs coming from APIs at the trust boundary.

## Alternatives

- **Classes with a private field** (`class UserId { #v: string }`) are truly nominal but add runtime objects and need `.value` unwrapping.
- **Template literal types** (`` `usr_${string}` ``) give partial safety if your ids have prefixes. They're structural but catch many mix-ups without casts.
- **Enums** are nominal for string enums, but only for closed sets of values.

## Pitfalls

- **Casts elsewhere defeat the purpose.** Keep `as UserId` inside the constructor or parser module, and lint against it elsewhere.
- **Serialization:** JSON from APIs arrives as plain strings. Brand at the boundary (when parsing responses).
- **Arithmetic loses brands:** `(a as Cents) + (b as Cents)` is `number`. Provide helper functions.
- **Overuse:** branding every string adds friction. Reserve it for ids and values where mix-ups are costly.

## In an interview, mention…

- Structural typing makes same-shape types interchangeable, and brands add a phantom nominal tag.
- Constructor or parse functions as the single cast point, which also encodes "validated".
- Zero runtime cost, and schema-library branding at trust boundaries.
- Alternatives (private-field classes, template literal ids) and the cost of overuse.
