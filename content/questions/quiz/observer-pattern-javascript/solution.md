## TL;DR

In the **Observer pattern**, a **subject** keeps a list of **observers** (subscribers) and **notifies them automatically when its state changes**. Observers subscribe and unsubscribe without the subject knowing what they do. It decouples **producers of events from consumers**, which is why it's everywhere in front-end code: **DOM events (`addEventListener`)**, **Node's `EventEmitter`**, **state stores** (Redux `subscribe`, Zustand, signals), **RxJS observables**, **`MutationObserver`/`IntersectionObserver`**, and **WebSocket message handling**.

## A minimal implementation

```js
function createObservable(initial) {
  let value = initial;
  const listeners = new Set();

  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      for (const fn of [...listeners]) fn(value); // copy: listeners may unsubscribe during notify
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);          // return an unsubscribe function
    },
  };
}

const cartCount = createObservable(0);
const unsubscribe = cartCount.subscribe((n) => (badge.textContent = String(n)));
cartCount.set(3);  // badge shows 3
unsubscribe();
```

Returning an unsubscribe function (instead of requiring `off(fn)`) makes cleanup easy and matches React's `useEffect` cleanup and `useSyncExternalStore`:

```jsx
function useCartCount() {
  return useSyncExternalStore(cartCount.subscribe, cartCount.get);
}
```

## Using the platform: EventTarget

```js
class Cart extends EventTarget {
  #items = [];
  add(item) {
    this.#items.push(item);
    this.dispatchEvent(new CustomEvent('change', { detail: { count: this.#items.length } }));
  }
}

const cart = new Cart();
const controller = new AbortController();
cart.addEventListener('change', (e) => console.log(e.detail.count), { signal: controller.signal });
cart.add({ sku: 'A1' });
controller.abort(); // removes the listener
```

`EventTarget` works in browsers, workers and Node, and supports `once`, `signal` and multiple event types.

## Use cases

- UI reacting to state changes: stores, signals, reactive frameworks.
- Decoupled modules: analytics listening to `checkout:completed` without the checkout code knowing about analytics.
- Real-time data: WebSocket/SSE messages fanned out to interested components.
- Browser observation APIs: `IntersectionObserver`, `ResizeObserver`, `MutationObserver`, `PerformanceObserver` are literally named after the pattern.
- Cross-tab communication: `BroadcastChannel`, the `storage` event.

## Observer vs Pub/Sub

| | Observer | Publish/Subscribe |
|---|---|---|
| Coupling | Observers subscribe directly to the subject | Publishers and subscribers only know a broker/channel name |
| Example | `button.addEventListener`, `store.subscribe` | Event bus, message broker, `BroadcastChannel` |
| Trade-off | Clear ownership | Very loose coupling, harder to trace |

## Pitfalls

- **Memory leaks**: forgetting to unsubscribe keeps observers (and everything they close over, like DOM nodes or components) alive. Always return/remember an unsubscribe and call it on teardown; `AbortSignal` helps group removals.
- **Hard-to-trace flow**: with many observers, "what happens when X changes?" requires searching the codebase. Global event buses are notorious for this.
- **Ordering and re-entrancy**: an observer that triggers another change during notification can cause loops or inconsistent intermediate states. Batch updates or guard against re-entrancy.
- **Error isolation**: one throwing observer can stop others from being notified in a naive loop; wrap calls or report errors per listener.
- **Performance**: notifying many observers on every tiny change; use selectors, equality checks and batching (as stores do).
- **Tearing in concurrent React**: external stores must be read via `useSyncExternalStore` to stay consistent during concurrent rendering.

## In an interview, mention…

- Subject + subscribers + notify, and returning an unsubscribe function.
- Real examples: DOM events, stores, browser `*Observer` APIs, RxJS.
- Observer vs pub/sub, and leaks/debuggability as the main costs.
