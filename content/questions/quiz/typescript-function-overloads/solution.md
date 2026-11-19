## TL;DR

Function overloads let one function have **several call signatures** that describe how the **return type depends on the argument types or count**. You write **overload signatures** (no body) followed by **one implementation signature** with a body that must be compatible with all of them. **Callers see only the overload signatures**, not the implementation. Use overloads when the relationship between inputs and outputs can't be expressed cleanly with a union or a generic. **Prefer unions, optional parameters or generics when they suffice**: they're simpler and compose better.

## Example

```ts
function parseDate(timestamp: number): Date;
function parseDate(isoString: string): Date;
function parseDate(year: number, month: number, day: number): Date;
function parseDate(a: number | string, month?: number, day?: number): Date {
  if (typeof a === 'string') return new Date(a);
  if (month !== undefined && day !== undefined) return new Date(a, month - 1, day);
  return new Date(a);
}

parseDate(1700000000000);
parseDate('2025-01-01');
parseDate(2025, 1, 1);
parseDate(2025, 1);        // error: no overload accepts two arguments
```

The implementation signature (`a: number | string, month?, day?`) would have allowed `parseDate(2025, 1)`, but it isn't callable from outside.

## Return types that depend on input

```ts
function getElement(selector: 'canvas'): HTMLCanvasElement;
function getElement(selector: 'video'): HTMLVideoElement;
function getElement(selector: string): HTMLElement | null;
function getElement(selector: string) {
  return document.querySelector(selector);
}

getElement('canvas').getContext('2d'); // HTMLCanvasElement
```

(The DOM's own `querySelector` uses a generic plus a tag-name map, `HTMLElementTagNameMap`, which is often a better approach than listing overloads.)

## Overloads vs alternatives

```ts
// Union is enough: the same return type for every input
function len(x: string | unknown[]): number { return x.length; }

// Generic is enough: the return type follows the input
function wrap<T>(x: T): T[] { return [x]; }

// Conditional return type: possible, but the implementation needs casts
function process<T extends string | number>(x: T): T extends string ? string[] : number { /* ... */ }
```

Overloads shine for **a few distinct, documented call shapes**, such as `addEventListener`-style APIs, `(key, value)` vs `(object)` setters, or legacy JS libraries with polymorphic arguments.

## Rules and gotchas

- **Order matters:** TypeScript picks the **first matching** overload, so put more specific signatures before general ones. A broad signature first shadows the rest.
- **Implementation compatibility:** each overload must be assignable to the implementation signature. The implementation's body isn't checked *against* each overload, so it can return the wrong type for a given overload without an error. Test it.
- **Union arguments don't match overloads:** with `parseDate(x)` where `x: string | number`, neither single overload matches unless you add a signature accepting the union.
- **`ReturnType` and `Parameters`** of an overloaded function use the **last** overload.
- **Methods and interfaces** can declare overloads too, and **arrow functions** can't (use a typed function expression or an interface with multiple call signatures).
- Excessive overloads produce noisy error messages ("No overload matches this call" lists them all).

## In an interview, mention…

- Overload signatures plus one hidden implementation signature.
- When to use them (input-dependent return types, distinct call shapes) vs unions and generics.
- Ordering, the unchecked implementation body, and union arguments not matching.
- `ReturnType` picks the last overload, and tag-name maps as an alternative pattern.
