## TL;DR

`"strict": true` turns on a **family of checks** that make TypeScript actually catch bugs. The most important are **`strictNullChecks`** (null and undefined aren't silently part of every type), **`noImplicitAny`**, **`strictFunctionTypes`**, **`strictPropertyInitialization`**, **`strictBindCallApply`**, **`useUnknownInCatchVariables`**, **`alwaysStrict`** and **`noImplicitThis`**. Newer strict-family flags are enabled automatically when you upgrade TypeScript with `strict` on. Beyond `strict`, high-value opt-ins include **`noUncheckedIndexedAccess`**, **`exactOptionalPropertyTypes`**, **`noImplicitOverride`**, **`noFallthroughCasesInSwitch`** and **`noPropertyAccessFromIndexSignature`**. New projects should start fully strict. Legacy projects migrate flag by flag.

## What `strict` includes

| Flag | Catches |
|---|---|
| `strictNullChecks` | `user.name` when `user` may be `undefined`. The biggest single win |
| `noImplicitAny` | Parameters and variables silently typed `any` |
| `strictFunctionTypes` | Unsafe callback parameter types (contravariance) |
| `strictPropertyInitialization` | Class fields that are never initialized |
| `strictBindCallApply` | Wrong arguments to `.call`/`.apply`/`.bind` |
| `useUnknownInCatchVariables` | `catch (e)` is `unknown`, not `any` |
| `noImplicitThis` | `this` implicitly typed `any` |
| `alwaysStrict` | Emits `"use strict"` and parses in strict mode |
| `strictBuiltinIteratorReturn` (TS 5.6) | Built-in iterators' `return` type is `undefined`, not `any` |

## Valuable extras

**`noUncheckedIndexedAccess`**

```ts
const scores: Record<string, number> = {};
const s = scores['ada'];   // number | undefined with the flag; number without
const first = [1, 2][5];   // number | undefined
```

This catches a whole class of "undefined is not an object" bugs in lookups and array access. The cost is more `?.` or guards, and `for…of` loops are unaffected.

**`exactOptionalPropertyTypes`**

```ts
interface Prefs { theme?: 'dark' | 'light' }
const p: Prefs = { theme: undefined }; // error with the flag: "missing" is not the same as "present but undefined"
```

This matters for APIs where `'theme' in obj` or `Object.keys` behaviour differs between the two.

**Others:** `noImplicitOverride` (requires the `override` keyword), `noFallthroughCasesInSwitch`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature` (forces `obj['key']` for index-signature access), and `noUnusedLocals`/`noUnusedParameters` (often left to ESLint instead).

## Module and emit-related settings worth knowing

`isolatedModules` / `verbatimModuleSyntax` (safe for per-file transpilers), `moduleResolution: "bundler"` or `"nodenext"`, `skipLibCheck` (speed vs catching broken `.d.ts`), and `erasableSyntaxOnly` (TS 5.8, for Node's type stripping). These aren't "strict" flags, but they shape correctness in modern toolchains.

## Migrating a legacy codebase

1. Turn on `strict` and run `tsc` to count errors per flag. Often `strictNullChecks` dominates.
2. Enable flags one at a time, or use a tool like `typescript-strict-plugin` to enforce strictness per file or directory as you migrate.
3. Fix root types first (API models, shared utilities), because errors cascade from them.
4. Avoid a mass `!` (non-null assertion) or `as any` sweep. Track remaining suppressions with lint rules (`no-non-null-assertion`, `no-explicit-any`) and burn them down.
5. Gate CI on "no new errors" with baselines.

## In an interview, mention…

- `strict` is a bundle, and `strictNullChecks` and `noImplicitAny` give the biggest value.
- The extras: `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, and their trade-offs.
- A strict-by-default policy for new code, and an incremental migration strategy for old code.
- Upgrading TypeScript can add new strict checks automatically, so plan upgrades.
