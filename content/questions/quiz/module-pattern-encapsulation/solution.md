## TL;DR

The **Module pattern** uses a **closure** (classically an **IIFE**) to create **private state and functions**, and **returns a public API object** that can access them. Code outside can only use what's returned, so internals can't be tampered with or collide with globals. It was the main encapsulation tool before ES2015; today **ES modules** (file-level scope with explicit `export`) and **private class fields (`#x`)** cover the same need natively, but the closure idea still powers hooks, factories and many libraries.

## Classic IIFE module

```js
const counter = (function () {
  let count = 0;                       // private
  function log(msg) { console.debug(`[counter] ${msg}`); } // private

  return {                             // public API
    increment() { count += 1; log(`now ${count}`); return count; },
    reset() { count = 0; },
    get value() { return count; },
  };
})();

counter.increment(); // 1
counter.value;       // 1
counter.count;       // undefined: not reachable from outside
```

The IIFE runs once, its local variables stay alive in the closure, and only the returned object is exposed.

## Revealing module variant

Define everything privately, then "reveal" chosen members:

```js
const auth = (() => {
  let token = null;
  const login = async (creds) => { token = await requestToken(creds); };
  const logout = () => { token = null; };
  const isLoggedIn = () => token !== null;
  return { login, logout, isLoggedIn }; // token stays private
})();
```

It makes the public API visible at a glance at the bottom of the module. A caveat: if a private function calls another private function, patching the public reference won't affect internal calls.

## Modern equivalents

**ES modules**: the file is the closure.

```js
// counter.js
let count = 0;                         // private to the module
export function increment() { return ++count; }
export function getValue() { return count; }
```

**Private class fields**: per-instance encapsulation enforced by the language.

```js
class Counter {
  #count = 0;
  increment() { return ++this.#count; }
  get value() { return this.#count; }
}
new Counter().#count; // SyntaxError outside the class
```

**Factory + closure** for many independent instances:

```js
function createCounter() {
  let count = 0;
  return { increment: () => ++count, get value() { return count; } };
}
```

## How it helps encapsulation

- **Information hiding**: callers can't depend on internals, so you can change them freely.
- **Invariants**: state can only change through methods that validate it.
- **No global pollution**: only one name (or none, with ES modules) is exposed.
- **Clear public API**: the returned object or the `export` list documents the contract.

## Trade-offs

- IIFE modules don't declare dependencies; they rely on globals or arguments passed into the IIFE (`(function ($) { … })(jQuery)`). ES modules fix this with `import`.
- Closure-based privacy makes debugging and testing internals harder (by design). Test through the public API.
- Each factory instance gets its own copies of functions (more memory than prototype methods), rarely a concern.
- Module-level state is shared by every importer and across requests in SSR, so be careful with mutable singletons.

## Where you still see it

- UMD library bundles and legacy code.
- React hooks: a custom hook is a closure exposing a small API over private state.
- Bundler output wraps each module in a function scope.

## In an interview, mention…

- Closure + IIFE + returned public API, and the revealing variant.
- ES modules and `#private` fields as today's native tools.
- Benefits (hiding, invariants, no globals) and the testing/shared-state considerations.
