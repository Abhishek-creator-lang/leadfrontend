## TL;DR

An **index signature** (`{ [key: string]: number }`) describes objects used as **dictionaries**, where key names aren't known in advance. `Record<K, V>` is the utility-type equivalent, and with a **finite key union** (`Record<'a' | 'b', V>`) it's an **exhaustive object**, which is different from a dictionary. By default TypeScript assumes **every key exists**, so `dict['missing']` is typed `number`, not `number | undefined`. Enable **`noUncheckedIndexedAccess`** to make lookups honest. Consider **`Map`** for dynamic keys, frequent insertions and deletions, or non-string keys.

## Syntax and rules

```ts
interface Scores {
  [player: string]: number;
}

const scores: Scores = { ada: 10, alan: 7 };
scores.grace = 3;           // allowed: any string key

interface Config {
  [key: string]: string | number; // all named props must be compatible with this
  name: string;                    // OK
  port: number;                    // OK
  // debug: boolean;               // error: boolean is not assignable to string | number
}
```

- Key types can be `string`, `number`, `symbol`, template literal patterns (`` [key: `data-${string}`]: string ``, TS 4.4+), or unions of those.
- Numeric index signatures must be compatible with string ones (JS converts numeric keys to strings).
- `keyof` a string-indexed type is `string | number`.

## Index signatures vs Record

```ts
type Dict = Record<string, number>;               // same as { [k: string]: number }
type RoleLabels = Record<'admin' | 'viewer', string>; // exactly these keys, all required

const labels: RoleLabels = { admin: 'Admin' };    // error: 'viewer' missing
```

Use `Record<Union, V>` for **exhaustive mappings**, which are great for catching missing entries when a union grows. Use `Partial<Record<Union, V>>` when entries are optional.

## The undefined problem

```ts
const prices: Record<string, number> = { apple: 1.2 };
const p = prices['banana'];  // type: number, value: undefined
p.toFixed(2);                // runtime crash, no compile error
```

With `"noUncheckedIndexedAccess": true`:

```ts
const p = prices['banana'];  // number | undefined
if (p !== undefined) p.toFixed(2);
```

This also applies to array element access (`arr[i]`). It adds some friction, but it prevents a very common class of production bugs.

## Dictionary vs Map

| | Object / index signature | `Map<K, V>` |
|---|---|---|
| Key types | string / number / symbol | Any value (objects too) |
| Prototype keys (`toString`, `__proto__`) | Possible collisions | None |
| Size | `Object.keys(o).length` | `map.size` |
| Frequent add/delete | OK | Optimized for it |
| JSON | Native | Needs conversion |
| `get` return type | `V` (or `V \| undefined` with the flag) | Always `V \| undefined` |

Objects are great for config and JSON-like data. `Map` is better for caches, frequently mutated dynamic keys, and non-string keys.

## Related flag

`noPropertyAccessFromIndexSignature` forces bracket access (`obj['key']`) for keys that only exist through an index signature, making "this key might not exist" visible in code reviews, while declared properties still use dot access.

## Pitfalls

- Using a broad index signature for objects that actually have known keys loses typo detection. Prefer explicit properties, or `Record<Union, V>`.
- `Object.entries(dict)` gives `[string, V][]`, which is fine. On typed objects with known keys, keys are still `string` (structural typing).
- Mixing an index signature with methods or properties of other types forces awkward unions. Split into a `{ meta; entries: Record<…> }` shape.

## In an interview, mention…

- Index signatures and `Record<string, V>` for dictionaries, and `Record<Union, V>` for exhaustive maps.
- The "every key exists" assumption, and `noUncheckedIndexedAccess` to fix it.
- Template literal index signatures, and the compatibility rule for named properties.
- When to use `Map` instead.
