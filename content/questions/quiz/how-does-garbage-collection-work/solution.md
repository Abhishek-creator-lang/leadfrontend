## TL;DR

JavaScript manages memory automatically. The engine frees objects that are no longer **reachable** from a set of **roots** (globals, the current call stack, active closures, pending callbacks, DOM tree references). Modern engines like V8 use **tracing, mark-and-sweep collection** with **generational** heaps (most objects die young), plus **incremental and concurrent** marking to keep pauses short. You can't trigger or time it, but you *can* cause **leaks** by keeping unwanted references alive.

## Reachability, not reference counting

```js
let user = { name: 'Ada' };
let admin = user;
user = null;   // object still reachable via admin
admin = null;  // now unreachable, so eligible for collection
```

Cycles are fine:

```js
function makeCycle() {
  const a = {}; const b = { a }; a.b = b;
}
makeCycle(); // a and b reference each other but neither is reachable, so both are collected
```

Old reference-counting collectors (early IE's COM/DOM objects) leaked cycles. Tracing collectors don't.

## How V8 does it (roughly)

1. **Young generation ("scavenger"):** new objects are allocated in a small space. Frequent, fast minor GCs copy survivors out; everything else is discarded wholesale.
2. **Old generation:** objects that survive a couple of minor GCs are promoted. Major GCs **mark** everything reachable from the roots, **sweep** the rest and sometimes **compact** to reduce fragmentation.
3. **Incremental/concurrent/parallel work:** marking runs in small steps and on helper threads, and idle time is used where possible, so main-thread pauses are typically a few milliseconds.

The details differ between V8, SpiderMonkey and JavaScriptCore, but all use reachability-based tracing.

## Common front-end leaks

```js
// 1. Listeners and timers that outlive their component
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  const id = setInterval(poll, 5000);
  return () => { window.removeEventListener('resize', onResize); clearInterval(id); };
}, []);

// 2. Detached DOM nodes held in JS
const cache = [];
cache.push(document.querySelector('#modal')); // node removed later but still referenced

// 3. Unbounded caches and module-level arrays
const results = new Map(); // grows forever unless you evict (LRU) or use WeakMap keyed by objects

// 4. Closures capturing more than needed
function handler(bigData) {
  return () => console.log(bigData.length); // keeps all of bigData alive while handler exists
}
```

Also: subscriptions (stores, WebSockets, observers) never unsubscribed, and global variables created accidentally in sloppy mode.

## Tools

- **`WeakMap`/`WeakSet`** to associate data with objects without keeping them alive.
- **`WeakRef`** and **`FinalizationRegistry`** for advanced caches. Their timing is unspecified, so never rely on them for correctness.
- **Chrome DevTools Memory panel:** take heap snapshots before and after an action repeated several times, compare them, and look for growing counts and "Detached" DOM nodes. The **retainers** view shows what is keeping an object alive. The Performance panel's memory track shows a sawtooth pattern that keeps climbing when something leaks.
- **`performance.measureUserAgentSpecificMemory()`** (cross-origin-isolated pages) for field monitoring.

## Pitfalls

- Setting a variable to `null` only helps if that was the **last** reference.
- `delete obj.prop` is not a memory tool and can slow down property access.
- Allocation-heavy code (creating many short-lived objects per frame) causes frequent minor GCs and jank in animations; reuse objects in hot paths.

## In an interview, mention…

- Reachability from roots and mark-and-sweep; cycles are not a problem.
- Generational, incremental and concurrent collection as the reason pauses are short.
- Concrete SPA leak patterns, how to find them with heap snapshots, and the role of cleanup functions and weak collections.
