## TL;DR

Declaration merging is TypeScript **combining multiple declarations with the same name into one definition**. The main forms: **interface + interface** (members are combined, which is the basis for extending globals and libraries), **namespace + namespace**, **namespace + function/class/enum** (attaching static members), and **enum + enum**. **Type aliases never merge** (a duplicate is an error), and **classes don't merge with classes**. Merging powers **global augmentation** (`Window`, `ProcessEnv`) and **module augmentation** (adding fields to a library's interfaces, such as a theme or a request object), but accidental merging can also cause confusing bugs.

## Interface merging

```ts
interface Box { width: number }
interface Box { height: number }
const b: Box = { width: 1, height: 2 }; // both members required
```

Rules:

- Non-function members must have **compatible (identical) types** if declared twice, otherwise it's an error.
- Function members with the same name become **overloads**. Later declarations' overloads come first (except string-literal-parameter overloads, which are hoisted).

## Augmenting globals

```ts
// globals.d.ts
export {}; // makes this file a module so `declare global` is allowed

declare global {
  interface Window {
    dataLayer: unknown[];
  }
  namespace NodeJS {
    interface ProcessEnv {
      API_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}
```

Now `window.dataLayer` and `process.env.API_URL` are typed everywhere.

## Augmenting modules

```ts
// theme.d.ts
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette { brand: Palette['primary'] }
  interface PaletteOptions { brand?: PaletteOptions['primary'] }
}
```

```ts
// express.d.ts
declare module 'express-serve-static-core' {
  interface Request { user?: { id: string; roles: string[] } }
}
```

Libraries deliberately expose interfaces (not type aliases) for this reason. Augmentation can only **add** to existing declarations. You can't add new top-level exports to a module this way, and you can't change existing member types.

## Namespace merging with functions, classes and enums

```ts
function format(value: number) { return value.toFixed(2); }
namespace format {
  export const defaultLocale = 'en-US';
}
format(3); format.defaultLocale; // callable with properties

enum Color { Red, Green }
namespace Color {
  export function parse(s: string): Color | undefined { /* ... */ }
}
```

In modern ES-module code, prefer plain objects and functions over namespaces. This pattern mostly appears in declaration files that describe existing JS libraries.

## Class + interface merging

```ts
interface Logger { level: string }
class Logger { log(msg: string) {} }
// Logger instances now have `level` in the type but nothing initializes it (unsafe)
```

This is used by mixin patterns but bypasses initialization checks. Use it with care.

## Pitfalls

- **Accidental global merges:** a script file (no imports or exports) declaring `interface User` merges with any other global `User`. Make files modules.
- **Silent API widening:** someone's augmentation adds an optional field everywhere, which can hide mistakes.
- **Augmentation not applied:** the `.d.ts` file must be included in the program (`include` in tsconfig), and module augmentation files must `import` or `export` something.
- Type aliases can't be augmented. If a library exports `type Props = {...}`, you can't extend it via merging.

## In an interview, mention…

- What merges (interfaces, namespaces, enums, namespace + function/class) and what doesn't (type aliases, classes).
- Practical use: `declare global` for `Window`/`ProcessEnv`, and `declare module` for library types.
- Interface method merging creates overloads, and conflicting property types are an error.
- Pitfalls: script vs module files, and accidental merges.
