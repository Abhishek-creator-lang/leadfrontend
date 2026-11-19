## TL;DR

`import type { User } from './types'` (TS 3.8+) imports **only types**, and the statement is **always erased** from the output. Inline modifiers (`import { type User, createUser } from './users'`, TS 4.5+) mark individual specifiers. They matter because **per-file transpilers** (esbuild, SWC, Babel, Vite, Node's type stripping) compile each file **without type information**, so they can't tell whether `import { User }` is a type (safe to drop) or a value (must keep). The **`verbatimModuleSyntax`** flag (TS 5.0) makes the rule simple: **imports without `type` are kept exactly as written, and imports with `type` are dropped**, and it errors when you import a type without `type`. It replaced `importsNotUsedAsValues` and `preserveValueImports`, and it's the recommended setting for modern projects.

## Why it matters

```ts
// user.ts
export interface User { id: string }
export function createUser(): User { return { id: '1' }; }

// app.ts
import { User, createUser } from './user';
```

`tsc` knows `User` is a type and elides it. A **single-file transpiler** sees `User` used only in type positions, but it can't know whether the binding is a value in `./user` (perhaps a class or an enum with side effects). Wrong guesses lead to:

- Runtime errors such as "The requested module does not provide an export named 'User'" when a type-only import is kept in native ESM.
- **Dropped side effects** when an import is removed even though the module needed to execute.

## Recommended setup

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

```ts
import type { User, Role } from './types';           // fully erased
import { type Settings, loadSettings } from './settings'; // only Settings is erased
export type { User };                                 // type-only re-export
```

With `verbatimModuleSyntax`:

- `import { User } from './types'` where `User` is only a type is an **error**, so you must write `type`.
- Side-effect imports and value imports are preserved exactly, so no surprises.
- In **CommonJS** output, you can't use ESM `import` syntax for values. You must write `import x = require()`. Projects emitting CJS often keep `isolatedModules` without `verbatimModuleSyntax`.

## isolatedModules

`isolatedModules: true` makes `tsc` report constructs that per-file transpilers can't handle: re-exporting types without `export type`, `const enum` usage across files, and similar. Use it whenever something other than `tsc` does the emitting (which is nearly every front-end project). Vite and Next.js templates enable it.

## Related: erasable syntax

TS 5.8's `--erasableSyntaxOnly` goes further, rejecting TS features that generate runtime code (enums, namespaces with values, parameter properties, `import x = require`). It's aimed at Node's built-in type stripping, where TypeScript syntax is simply removed.

## Tooling

- `@typescript-eslint/consistent-type-imports` auto-fixes imports to use `type`.
- `import type` also helps **avoid circular-dependency runtime problems**, because type-only imports never create runtime edges.
- Type-only imports of classes can't be used with `new` or `instanceof`. Those need a value import.

## Pitfalls

- `import type Foo from './foo'` followed by `new Foo()` errors. Switch to a value import.
- Mixing default and named type imports: `import type Foo, { Bar }` is not allowed. Split into two statements.
- Enabling `verbatimModuleSyntax` in a CJS project without understanding the output change.

## In an interview, mention…

- Per-file transpilers lack type info, so explicit `type` imports remove ambiguity.
- `verbatimModuleSyntax` (5.0) as the simple, predictable rule, plus `isolatedModules`.
- Benefits: correct ESM output, preserved side effects, fewer runtime cycles.
- Erasable-syntax constraints for Node's type stripping, and lint auto-fixes.
