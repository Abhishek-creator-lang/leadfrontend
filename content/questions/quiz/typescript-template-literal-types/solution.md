## TL;DR

Template literal types (TS 4.1+) use **JavaScript template-string syntax at the type level** to **build string literal types from other types**: `` `on${Capitalize<E>}` ``. When placeholders are unions, the result is the **cross product** of all combinations. Combined with **`infer`** they **parse** strings (route params, dotted paths), and combined with **mapped-type key remapping** they derive property names (`onClick`, `getName`). Built-in intrinsic helpers: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`.

## Building strings

```ts
type Size = 'sm' | 'md' | 'lg';
type Color = 'primary' | 'danger';
type ButtonClass = `btn-${Color}-${Size}`;
// 'btn-primary-sm' | 'btn-primary-md' | ... (6 members)

type CssLength = `${number}px` | `${number}rem` | `${number}%`;
const w: CssLength = '12px';   // OK
const h: CssLength = '12 px';  // error
```

Placeholders accept `string`, `number`, `bigint`, `boolean`, `null`, `undefined` and unions of literals. `` `${number}px` `` is a **pattern** type: it accepts any numeric string followed by `px`.

## Deriving keys

```ts
type EventName = 'click' | 'focus' | 'blur';
type HandlerProps = { [E in EventName as `on${Capitalize<E>}`]?: (e: Event) => void };
// { onClick?: ...; onFocus?: ...; onBlur?: ... }
```

## Parsing with infer

```ts
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}` ? [Head, ...Split<Tail, D>] : [S];

type Parts = Split<'a.b.c', '.'>; // ['a', 'b', 'c']

type ExtractParams<Path extends string> =
  Path extends `${string}:${infer P}/${infer Rest}` ? P | ExtractParams<Rest>
  : Path extends `${string}:${infer P}` ? P
  : never;

function buildUrl<P extends string>(path: P, params: Record<ExtractParams<P>, string>) { /* ... */ }
buildUrl('/orgs/:orgId/users/:userId', { orgId: '1', userId: '2' }); // both required
```

## Typed dotted paths

```ts
type Paths<T> = {
  [K in keyof T & string]: T[K] extends object ? K | `${K}.${Paths<T[K]>}` : K;
}[keyof T & string];

type Settings = { theme: { mode: string; accent: string }; locale: string };
type SettingPath = Paths<Settings>; // 'theme' | 'theme.mode' | 'theme.accent' | 'locale'
```

Form libraries (React Hook Form's `Path<T>`) and i18n libraries (typed translation keys) use this technique.

## Pitfalls

- **Combinatorial explosion:** unions multiply. Several 50-member unions can exceed TypeScript's union size limit (around 100,000 members) or slow the editor.
- **Inference is greedy or lazy in specific ways:** `${infer A}${infer B}` gives `A` the first character. Test your parsers.
- **Recursion depth:** long strings can hit instantiation depth limits.
- They're compile-time only. Runtime strings from users still need validation.
- `keyof T` may include `number`/`symbol`. Intersect with `string` before interpolating.

## In an interview, mention…

- String literal types built from other types, with union cross products.
- Intrinsic case helpers, and pattern types like `` `${number}px` ``.
- Parsing with `infer` for route params and dotted paths, and key remapping for handler props.
- Performance and complexity limits, and runtime validation still matters.
