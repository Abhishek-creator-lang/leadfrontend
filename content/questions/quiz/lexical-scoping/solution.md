## TL;DR

**Lexical (static) scoping** means a variable's visibility is determined by **where the code is written** in the source, not by **where or how a function is called**. When a name is used, JavaScript looks in the current scope, then in the **enclosing scopes as written in the code**, out to the global scope. This rule is what makes **closures** possible: a function keeps access to the scope it was defined in, even after that outer function has returned.

## Example

```js
const level = 'global';

function outer() {
  const level = 'outer';
  function inner() {
    return level; // resolved by where inner is *written*: inside outer
  }
  return inner;
}

function caller() {
  const level = 'caller';
  return outer()(); // calling it from here doesn't matter
}

caller(); // 'outer'
```

With **dynamic scoping** (Bash, early Lisps, Perl's `local`), `inner` would see the *caller's* variables and return `'caller'`. JavaScript never does that for variables.

## The scope chain

Each function, block and module creates a scope (an *environment record* in spec terms) that holds a reference to its **outer** environment, fixed when the function is created:

```js
const a = 1;
function f() {
  const b = 2;
  {
    const c = 3;
    console.log(a + b + c); // c: block → b: f → a: module/global
  }
}
```

Lookup walks outward and stops at the first match. An inner declaration with the same name **shadows** the outer one. If nothing matches, you get a `ReferenceError` (or, in sloppy mode, an assignment creates an accidental global).

## Closures follow directly

```js
function makeCounter() {
  let count = 0;
  return () => ++count; // remembers makeCounter's scope
}
const next = makeCounter();
next(); // 1
next(); // 2
```

The arrow function's outer environment is the one created by that particular call to `makeCounter`, and it stays alive as long as `next` is reachable.

## The exception: `this` (and friends)

`this`, `arguments`, `super` and `new.target` in **regular functions are dynamic**: they depend on how the function is called. **Arrow functions** have none of their own, so they resolve these **lexically** from the enclosing scope, which is why arrows are handy for callbacks inside methods:

```js
class Clock {
  seconds = 0;
  start() {
    setInterval(() => { this.seconds++; }, 1000); // `this` from start()
  }
}
```

## Why it matters

- **Predictability:** you can understand a function's variables by reading the code around it.
- **Tooling:** bundlers, minifiers and linters can rename and tree-shake variables safely because references are resolvable statically. `eval` and `with` break this, which is one reason they are avoided (`with` is banned in strict mode).
- **React hooks:** each render's event handlers and effects close over the props/state of *that* render. This lexical capture is the source of "stale closure" bugs when dependency arrays are wrong.

## In an interview, mention…

- Scope is decided at author time by nesting; call site is irrelevant for variable lookup.
- The scope chain, shadowing and `ReferenceError` on failed lookup.
- Closures as the consequence, and `this` as the dynamic exception that arrow functions make lexical.
