## TL;DR

`using` and `await using` (TS 5.2, the ECMAScript **Explicit Resource Management** proposal) declare a variable whose resource is **automatically disposed when the enclosing block exits**, whether normally, by `return`, or by a thrown error. The object must implement **`[Symbol.dispose]()`** (or **`[Symbol.asyncDispose]()`** for `await using`). Disposal runs in **reverse declaration order**, like a stack. It replaces error-prone `try/finally` cleanup for **file handles, locks, subscriptions, timers, temporary DOM state, DB transactions and spans**. `DisposableStack`/`AsyncDisposableStack` help with ad-hoc and conditional cleanup. Runtime support is arriving (recent V8-based Chrome and Node), and otherwise you need the polyfilled symbols plus TS downlevelling.

## Before and after

```ts
// try/finally: easy to forget, and nesting gets ugly
const conn = await db.connect();
try {
  const tx = await conn.begin();
  try {
    await tx.query('...');
    await tx.commit();
  } finally {
    await tx.release();
  }
} finally {
  await conn.close();
}
```

```ts
// using: cleanup is tied to scope
{
  await using conn = await db.connect();   // has [Symbol.asyncDispose]
  await using tx = await conn.begin();
  await tx.query('...');
  await tx.commit();
} // tx disposed first, then conn, even if anything above throws
```

## Making something disposable

```ts
function subscribe(target: EventTarget, type: string, handler: EventListener): Disposable {
  target.addEventListener(type, handler);
  return {
    [Symbol.dispose]() {
      target.removeEventListener(type, handler);
    },
  };
}

function measure(label: string): Disposable {
  const start = performance.now();
  return { [Symbol.dispose]: () => console.log(label, performance.now() - start, 'ms') };
}

function processBatch(items: Item[]) {
  using _timer = measure('processBatch');
  using _sub = subscribe(window, 'beforeunload', warnUnsaved);
  // ... work ...
} // both disposed here, in reverse order
```

## DisposableStack

```ts
function openAll(paths: string[]) {
  using stack = new DisposableStack();
  const files = paths.map(p => stack.use(openFile(p))); // each registered for disposal
  if (files.length === 0) throw new Error('nothing to open'); // all opened files get disposed
  const owned = stack.move(); // transfer ownership out: nothing is disposed at scope exit
  return { files, [Symbol.dispose]: () => owned.dispose() };
}
```

`stack.defer(fn)` registers arbitrary cleanup callbacks. `adopt(value, onDispose)` wraps non-disposable values.

## Errors during disposal

If the block throws *and* a disposer throws, both errors are preserved in a **`SuppressedError`** (`error`, `suppressed`), so cleanup failures don't silently swallow the original exception.

## Setup requirements

```json
{ "compilerOptions": { "target": "es2022", "lib": ["es2022", "esnext.disposable", "dom"] } }
```

- TS downlevels `using` for older targets, but `Symbol.dispose`/`Symbol.asyncDispose` must exist at runtime (a polyfill such as core-js, or a modern runtime).
- `using` is only allowed in blocks, function bodies, `for` heads and modules. `await using` needs an async context.
- A `null` or `undefined` initializer is allowed (it's skipped), which helps with conditional resources.

## Front-end relevance

React components already have effect cleanups for lifecycle-bound resources, so `using` is more useful in **non-React code**: SDKs, workers, test helpers (fake timers, temporary DOM fixtures, mock servers), build scripts, Node backends, and Playwright fixtures.

## In an interview, mention…

- Scope-bound deterministic cleanup via `Symbol.dispose`/`asyncDispose` (TS 5.2).
- Reverse-order disposal, and `SuppressedError` for errors during cleanup.
- `DisposableStack` for dynamic or conditional resources and ownership transfer.
- Runtime and polyfill requirements, and where it fits relative to React effect cleanups.
