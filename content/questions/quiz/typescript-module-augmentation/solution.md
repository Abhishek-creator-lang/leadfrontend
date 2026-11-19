## TL;DR

Module augmentation lets you **add declarations to an existing module's types**, typically a third-party package, without forking it. You write `declare module 'pkg' { interface Existing { newField: X } }` in a file that is itself a **module** (it has an `import` or `export`). The new members **merge** with the original interfaces via declaration merging. **Global augmentation** (`declare global { … }`) does the same for globals such as `Window` or `NodeJS.ProcessEnv`. You can **add members to interfaces and namespaces**, but you **can't add new top-level exports** or change existing members' types, and **type aliases can't be augmented**.

## Typical cases

**Theme typing in a UI library**

```ts
// mui-theme.d.ts
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}
```

Now `theme.palette.brand.main` type-checks everywhere.

**Request context in a server framework**

```ts
// types/express.d.ts
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; roles: string[] };
  }
}
```

**Library "registry" interfaces** designed for augmentation:

```ts
// TanStack Router, i18next, Redux Toolkit and others expose a `Register`-style interface
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { common: typeof import('./locales/en/common.json') };
  }
}
```

Libraries use this to give **app-specific types** to library APIs (route paths, translation keys) without generics on every call.

## Global augmentation

```ts
// env.d.ts
export {};

declare global {
  interface Window {
    __APP_CONFIG__: { apiUrl: string };
  }
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}
```

Vite projects augment `ImportMetaEnv` similarly, for `import.meta.env.VITE_*`.

## Why the file must be a module

In a **script** file (no top-level import or export), `declare module 'x' { … }` is an *ambient module declaration* that **replaces or defines** the module's types rather than augmenting them. Adding `import 'x'` or `export {}` turns it into an augmentation that merges. This is the most common reason "my augmentation does nothing" or "suddenly all of the library's types disappeared".

## Making sure it's included

- The `.d.ts` file must be part of the compilation (`include` in tsconfig, or imported somewhere).
- The module specifier must match the module that **declares** the interface. Sometimes it's an internal path (`express-serve-static-core`, not `express`). Check the library's `.d.ts`.
- Monorepos: every package that relies on the augmentation needs it in scope.

## Limitations and cautions

- You can only add to interfaces, namespaces and similar mergeable declarations. You can't override a property's type, add a new export, or augment a `type` alias.
- Augmentations are **global to the program**, so they affect every file and can hide errors (an optional field "exists" everywhere).
- Augmenting types doesn't change runtime behaviour. Make sure the runtime actually provides what you declared (middleware that sets `req.user`, for example).
- Prefer library-provided extension points (generics, registries) over patching internals that may change between versions.

## In an interview, mention…

- `declare module 'pkg'` merges into existing interfaces, and the file must be a module.
- `declare global` for `Window`/`ProcessEnv`/`ImportMetaEnv`.
- Real uses: themes, request objects, registry interfaces for typed routes and i18n keys.
- Limits (no new exports, no type aliases), and that types aren't runtime.
