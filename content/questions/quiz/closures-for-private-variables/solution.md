## TL;DR

Declare variables **inside a function** and **return functions that use them**. Because of closures, the returned functions keep access to those variables, but **no code outside can reach them**: there's no property to read or overwrite. This is the **module / factory pattern**. Today, **`#private` class fields** offer language-level privacy for classes, but closures remain the idiomatic tool for factories, hooks and modules.

## Factory with private state

```js
function createWallet(initial = 0) {
  let balance = initial;           // private
  const history = [];              // private

  function record(type, amount) {  // private helper
    history.push({ type, amount, at: Date.now() });
  }

  return {
    deposit(amount) {
      if (amount <= 0) throw new RangeError('amount must be positive');
      balance += amount;
      record('deposit', amount);
    },
    withdraw(amount) {
      if (amount > balance) throw new Error('insufficient funds');
      balance -= amount;
      record('withdraw', amount);
    },
    get balance() { return balance; },          // read-only view
    history: () => history.map((h) => ({ ...h })), // copies, so callers can't mutate
  };
}

const w = createWallet(50);
w.deposit(25);
w.balance;      // 75
w.balance = 1e6; // ignored (no setter); TypeError in strict mode
w.secret;       // undefined: there is nothing to access
```

The only way to change `balance` is through the methods, so the invariants (no negative deposits, no overdraft) can't be bypassed.

## Module pattern (IIFE), the pre-ES-modules version

```js
const analytics = (() => {
  const queue = [];
  const flush = () => navigator.sendBeacon('/collect', JSON.stringify(queue.splice(0)));
  addEventListener('pagehide', flush);
  return { track: (event) => queue.push(event) };
})();
```

With ES modules, top-level variables that aren't exported are already private to the module, so the IIFE is rarely needed today.

## Compared with `#private` fields

```js
class Wallet {
  #balance;
  constructor(initial = 0) { this.#balance = initial; }
  deposit(n) { this.#balance += n; }
  get balance() { return this.#balance; }
}
```

| | Closure factory | `#private` class fields |
|---|---|---|
| Privacy | Absolute (unreachable) | Absolute (syntax-level; even `Proxy`/reflection can't see them) |
| Methods | New function objects per instance | Shared on the prototype |
| Memory with many instances | Higher | Lower |
| `this` issues | None, methods can be passed around freely | Methods need binding when used as callbacks |
| `instanceof`, inheritance | No | Yes |
| Brand checks | Manual | `#balance in obj` |

Rule of thumb: thousands of instances → class with `#fields`; a few objects, or composition-heavy code → closures.

## React hooks use the same idea

```js
function useCounter() {
  const [count, setCount] = useState(0);
  const timer = useRef(null); // private to this component instance
  return { count, inc: () => setCount((c) => c + 1) };
}
```

## Pitfalls

- **Returning internal references** (like `history` itself) leaks mutability. Return copies or frozen views.
- **Memory:** every closure keeps its whole captured environment alive while it's reachable.
- **Debugging:** private closure state is visible in DevTools under `[[Scopes]]`, but not to code. That's a feature, but it also means tests must go through the public API.
- **Not a security boundary** against code running in the same page; any script can monkey-patch the globals you rely on.

## In an interview, mention…

- Closures capture variables, not copies, and nothing outside can name them.
- Factory/module pattern vs `#private` fields, and the memory and `this` trade-offs.
- Expose read-only views and copies to preserve invariants.
