## Approach

The function becomes a small protocol dispatcher:

1. **Validate** `fn`. A non-function is a programming error, so throw a `TypeError` immediately.
2. **Look up the custom implementation** with `fn[promisify.custom]`. If it's present, validate it and return it untouched. The author knows the right promise shape better than a generic wrapper does.
3. **Otherwise build the standard wrapper** from Promisify.
4. **Tag the wrapper** with `Object.defineProperty(wrapper, promisify.custom, { value: wrapper })`. The next `promisify(wrapper)` call hits step 2 and returns it, so promisifying is idempotent and you never get a promise-returning function wrapped in a callback-expecting wrapper.

## Why a symbol, and why `Symbol.for`?

- A **symbol key** can't collide with ordinary properties. A string key like `'promisified'` might already be used by the function, and it shows up in `Object.keys`.
- **`Symbol.for(key)`** returns the same symbol from the global registry for the same key, across modules, bundles, and even realms such as same-origin iframes (the spec shares the registry between all realms). So a library can attach a custom implementation **without depending on your module**: it just calls `Symbol.for('nodejs.util.promisify.custom')`. A plain `Symbol()` would be unique to your module, and others would need to import it.

## Complexity

O(1) to build or return the function. Each call of the wrapper costs O(n) to forward n arguments.

## Edge cases

- **Custom property is `undefined`:** treat it as absent and build a normal wrapper. Only a defined but non-callable value is an error.
- **Inherited custom implementations:** `fn[promisify.custom]` reads the prototype chain, so a class can define it once for all its functions. That's also Node's behaviour.
- **Wrapper's own properties:** use `defineProperty` (non-enumerable) so the tag doesn't show up when someone inspects the function.
- **Multiple values without a custom implementation:** only the first value is kept, same as Node. That's exactly the case the custom symbol exists for.

## Common mistakes

- **Wrapping the custom function** instead of returning it. It's already promise-based, so wrapping it would append a callback it never calls, and the promise would hang forever.
- **Calling the custom function** instead of returning it.
- **Checking `typeof custom === 'function'` and silently falling back** when it isn't. A bad custom value is a bug that should surface loudly.
- **Using `Symbol('...')`**, which breaks interop with other code that expects the registered symbol.

## Similar symbol-based protocols

- `Symbol.iterator` / `Symbol.asyncIterator`: how `for...of` and `for await` find iteration.
- `Symbol.toPrimitive`: custom coercion.
- `Symbol.hasInstance`: customises `instanceof`.
- `Symbol.for('nodejs.util.inspect.custom')`: custom `console.log` output in Node. It's the same registered-symbol pattern as this question.
- `Symbol.dispose` / `Symbol.asyncDispose`: explicit resource management (`using`).

These all follow the same design: the language or runtime defines a protocol, and objects opt in by placing a function under an agreed symbol.
