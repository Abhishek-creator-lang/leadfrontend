## TL;DR

**Enums** are one of the few TypeScript features that **emit runtime code** (an object, plus a reverse mapping for numeric enums). **Union literal types** (`'active' | 'archived'`) are **type-only** and erased at compile time. Most modern codebases **prefer union literals**, optionally backed by an **`as const` object** when they need runtime values. They're plain JavaScript, work with `isolatedModules`, `verbatimModuleSyntax` and type-stripping tools (Node's built-in TS support, `--erasableSyntaxOnly` in TS 5.8), interoperate with JSON and APIs, and avoid numeric enums' soundness quirks. Enums still offer **nominal-ish typing** and a familiar namespace, and are fine when a team prefers them.

## What enums compile to

```ts
enum Direction { Up, Down }
// var Direction; (function (Direction) {
//   Direction[Direction["Up"] = 0] = "Up";
//   Direction[Direction["Down"] = 1] = "Down";
// })(Direction || (Direction = {}));
```

Numeric enums create a two-way map (`Direction[0] === 'Up'`). String enums (`Up = 'UP'`) create a one-way map.

## Problems with enums

- **Numeric enums accept arbitrary numbers** in older TS versions. TS 5.0 tightened this for literal enum members, but numeric enums remain looser than unions in places, and reverse mappings add runtime noise.
- **Nominal-ish behaviour for string enums:** you can't pass the string `'UP'` where `Direction.Up` is expected, so values coming from JSON or APIs need casting or mapping.
- **Not erasable:** tools that just strip types (Babel's TS preset with `isolatedModules`, esbuild, Node's `--experimental-strip-types` which is now on by default) can't handle **`const enum`** across files, and runtime enums are rejected under `--erasableSyntaxOnly`.
- **`const enum`** inlines values but breaks with `isolatedModules` across module boundaries and in published `.d.ts` files. Generally avoid it in libraries.

## Union literal alternative

```ts
export const Status = {
  Active: 'active',
  Archived: 'archived',
  Draft: 'draft',
} as const;

export type Status = (typeof Status)[keyof typeof Status]; // 'active' | 'archived' | 'draft'

function setStatus(s: Status) {}
setStatus(Status.Active); // named constant, like an enum
setStatus('draft');       // plain strings from APIs also work

const ALL_STATUSES = Object.values(Status); // iterate at runtime
```

Or simply `type Status = 'active' | 'archived' | 'draft'` when you don't need runtime values.

## Comparison

| | `enum` | Union literals (+ `as const` object) |
|---|---|---|
| Runtime output | Yes | Only if you write the object |
| Accepts raw string values | No (string enums) | Yes |
| Erasable / type-strip friendly | No | Yes |
| Exhaustive `switch` | Yes | Yes |
| Rename refactoring | Good | Good with an object, OK with plain unions |
| Iterate values | Yes (watch numeric reverse keys) | `Object.values` on the object |
| Bundle size | Small runtime cost | Zero (plain unions) |

## When enums are reasonable

- The team convention favours them, and the code isn't type-stripped without `tsc`.
- Bit flags (`enum Perm { Read = 1 << 0, Write = 1 << 1 }`), though a const object works there too.
- Mirroring enum concepts from backend code generators (some GraphQL and OpenAPI generators emit enums, and most can be configured to emit unions instead).

## In an interview, mention…

- Enums emit runtime code, while unions are erased.
- Why modern setups prefer unions: erasable syntax, `isolatedModules`, API interop.
- The `as const` object pattern that gives you named constants plus a union type.
- `const enum` caveats, and the numeric enum quirks.
