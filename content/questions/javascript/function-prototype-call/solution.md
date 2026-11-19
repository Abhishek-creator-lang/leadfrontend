## The core idea

JavaScript sets `this` automatically in exactly one ordinary situation without `call`/`apply`/`bind`: a **method call**. When you evaluate `obj.fn(...)`, `this` inside `fn` is `obj`. So the polyfill:

1. Temporarily stores the function on `thisArg` under a unique key.
2. Calls it as a method: `context[key](...args)`.
3. Deletes the key and returns the result.

## Step by step

1. `const fn = this`. When you write `greet.myCall(...)`, `this` inside `myCall` is `greet`. If it isn't a function, throw a `TypeError`.
2. Normalize the context: `null`/`undefined` becomes `globalThis`, and primitives are boxed with `Object(thisArg)`. You can't add properties to a primitive.
3. Create a **`Symbol`** for the key. Symbols are unique, so they never overwrite an existing `fn` or `__fn__` property. They also don't show up in `Object.keys` or `for...in`, and JSON serialization ignores them.
4. Define the property with `Object.defineProperty(..., { configurable: true })`. Plain assignment would also work, but `defineProperty` keeps it non-enumerable even for code that lists symbols.
5. Call it inside `try { ... } finally { delete context[key]; }` so the cleanup runs even when the function throws.

## Complexity

O(1) overhead per call, on top of the function's own work.

## Edge cases and limitations

| Case | Native `call` | This polyfill |
|---|---|---|
| Strict function, `thisArg = 5` | `this === 5` | `this` is a `Number` object |
| Strict function, `thisArg = null` | `this === null` | `this === globalThis` |
| Frozen or non-extensible `thisArg` | works | `defineProperty` throws `TypeError` |
| Proxy `thisArg` | no traps triggered | `defineProperty`/`get`/`deleteProperty` traps fire |
| `thisArg` with a setter-heavy prototype | unaffected | unaffected, since `defineProperty` bypasses setters |

These are inherent to the method-call trick. In an interview, say so. It shows you know the trick is an approximation and that real engines set `this` directly in the function's environment record.

## Common mistakes

- **Using a string key like `'fn'`.** It overwrites a real property on `thisArg` and then deletes it.
- **Forgetting `finally`.** A throwing function leaves the temporary key behind.
- **Returning nothing.** `call` must return the function's result.
- **Using `arguments` and `eval`** to build the argument list. That was the ES3-era technique. Rest/spread makes it unnecessary.
- **Writing `myCall` as an arrow function**, which loses access to the target function via `this`.

## `call` vs `apply` vs `bind`

- `call(thisArg, a, b)` invokes immediately with arguments listed one by one.
- `apply(thisArg, [a, b])` invokes immediately with an array-like of arguments. It was historically the way to spread arrays (`Math.max.apply(null, arr)`).
- `bind(thisArg, a)` returns a **new function** with `this` and the leading arguments fixed. It does not invoke.

## Follow-ups

- **Borrowing methods:** `Array.prototype.slice.call(arguments)` was the classic way to convert array-likes. Today you would use `Array.from` or spread.
- **Why not `fn.call` inside a library?** Because user code can overwrite `fn.call`. Robust libraries use `Reflect.apply(fn, thisArg, args)` or cache `Function.prototype.call` up front.
