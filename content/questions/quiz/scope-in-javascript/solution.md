## TL;DR

**Scope** is the region of code where a name (variable, function, class) can be accessed. JavaScript has **global scope**, **module scope**, **function scope** and **block scope** (`{}` for `let`, `const`, `class`). **`var` is function-scoped**, while **`let`/`const` are block-scoped** and live in a **temporal dead zone** until their declaration runs. Scopes nest **lexically**, and name lookup walks outward through this **scope chain**.

## The kinds of scope

```js
// Global scope (classic script): visible everywhere
var siteName = 'Shop';     // also becomes window.siteName
let theme = 'dark';        // global, but NOT a property of window

function checkout(cart) {  // function scope
  var total = 0;           // visible in the whole function
  for (let i = 0; i < cart.length; i++) { // block scope: i lives only in the loop
    const item = cart[i];  // block scope: a fresh binding each iteration
    total += item.price;
  }
  // console.log(i);       // ReferenceError
  if (total > 100) {
    var discount = 10;     // var ignores the block: hoisted to the function
  }
  return total - (discount ?? 0);
}
```

**Module scope:** in ES modules, top-level declarations are private to the module. Nothing leaks to `window` unless exported or assigned explicitly. This is the main reason modern apps don't suffer from global collisions.

| | `var` | `let` / `const` | `function` declaration | `class` |
|---|---|---|---|---|
| Scope | Function (or global) | Block | Function (block in strict mode) | Block |
| Hoisted | Yes, initialised to `undefined` | Yes, but uninitialised (TDZ) | Yes, fully initialised | Yes, TDZ |
| Re-declare in same scope | Allowed | SyntaxError | Allowed (sloppy) | SyntaxError |
| Global object property | Yes (classic scripts) | No | Yes (classic scripts) | No |

## Temporal dead zone

```js
console.log(a); // undefined (var hoisted and initialised)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
var a = 1;
let b = 2;
```

The TDZ catches use-before-declaration bugs that `var` would silently allow.

## Scope chain and shadowing

```js
const user = 'global';
function show() {
  const user = 'local'; // shadows the outer one
  return user;
}
```

Lookups go from the innermost scope outward and stop at the first match.

## The classic loop example

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2
```

`var` creates one binding for the whole function; `let` in a `for` header creates a new binding per iteration, so each callback captures its own value.

## Other scope-related details

- **Catch parameters** are scoped to the `catch` block.
- **Named function expressions** have their name visible only inside themselves: `const f = function fact(n) { return n ? n * fact(n - 1) : 1; }`.
- **`globalThis`** is the standard way to reach the global object in browsers, workers and Node.
- **Sloppy-mode implicit globals:** assigning to an undeclared name creates a global. Strict mode (default in modules and classes) throws instead.

## Pitfalls

- Using `var` in blocks and expecting block scoping.
- Accidentally relying on globals across `<script>` tags; prefer modules.
- Shadowing that hides a bug (e.g. a local `name` shadowing a parameter). Linters (`no-shadow`) help.

## In an interview, mention…

- Global, module, function and block scope, with `var` vs `let`/`const` differences.
- Hoisting and the TDZ, the scope chain and shadowing.
- The `for` loop closure example, and why ES modules and strict mode make scope safer.
