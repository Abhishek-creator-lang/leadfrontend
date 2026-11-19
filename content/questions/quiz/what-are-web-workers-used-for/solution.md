## TL;DR

Workers run JavaScript **on a separate thread** with its own event loop and global scope, communicating with the page by **message passing** (`postMessage`). Their main purpose is to keep **CPU-heavy work off the main thread** so input, animation and rendering stay responsive. Workers **cannot touch the DOM**. There are three kinds: **dedicated workers** (one page), **shared workers** (several tabs of one origin) and **service workers** (a network proxy for offline support, caching and push).

## Dedicated worker example

```js
// main.js
const worker = new Worker(new URL('./parse.worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ csv: hugeCsvString });
worker.onmessage = (e) => renderTable(e.data.rows);
worker.onerror = (e) => console.error('worker failed', e.message);

// parse.worker.js
self.onmessage = (e) => {
  const rows = e.data.csv.split('\n').map((line) => line.split(','));
  self.postMessage({ rows });
};
```

Parsing a 50 MB file here no longer freezes scrolling or typing. That directly improves **INP** (Interaction to Next Paint).

## Good use cases

- Parsing/serialising large JSON, CSV or Markdown; syntax highlighting; diffing.
- Image/video/audio processing, compression, encryption and hashing.
- Search indexing and fuzzy matching over large client-side datasets.
- Running WebAssembly modules (e.g. SQLite in the browser, codecs).
- Rendering with `OffscreenCanvas` (`canvas.transferControlToOffscreen()`), e.g. charts and maps.
- Polling or sync logic that shouldn't be throttled with the UI.

## Communication and data transfer

- `postMessage` **copies** data with the **structured clone algorithm** (supports `Map`, `Date`, typed arrays and cycles; not functions, DOM nodes or class prototypes).
- For large binary data, **transfer** ownership instead of copying. This is near-zero-cost, and the sender loses access:

```js
const buffer = new ArrayBuffer(64 * 1024 * 1024);
worker.postMessage(buffer, [buffer]);
buffer.byteLength; // 0 on the main thread now
```

- `SharedArrayBuffer` + `Atomics` allow true shared memory, but require **cross-origin isolation** (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`).
- Libraries like **Comlink** wrap `postMessage` in a promise/RPC interface so you can `await api.parse(csv)`.

## The three kinds

| | Dedicated | Shared | Service |
|---|---|---|---|
| Scope | One page | All same-origin pages that connect | Controls pages in its scope |
| Lifetime | Lives with the page | While any client is connected | Event-driven; browser starts/stops it |
| Typical use | Heavy computation | Shared connection/state across tabs | Offline caching, request interception, push, background sync |

Note: `SharedWorker` is available in all modern desktop browsers and Safari, but not in Chrome for Android.

## Pitfalls

- **Cost:** starting a worker takes some time and memory, and copying data back and forth can cost more than the work saved for small tasks. Reuse a worker or a pool, and transfer buffers.
- **No DOM, no `window`.** Workers do have `fetch`, `IndexedDB`, `WebSocket`, timers, `crypto` and `OffscreenCanvas`.
- **Bundler setup:** use the `new Worker(new URL(..., import.meta.url), { type: 'module' })` pattern so Vite/webpack can detect and bundle the worker.
- **Errors are isolated:** handle `error` and `messageerror` events, and terminate stuck workers with `worker.terminate()`.
- For simply *yielding* during long main-thread work, `scheduler.yield()` or chunking may be enough. Workers are for genuinely parallel work.

## In an interview, mention…

- Main-thread responsiveness (INP, long tasks) is the motivation.
- Structured clone vs transferables vs `SharedArrayBuffer` and the isolation headers it needs.
- Choosing between dedicated, shared and service workers, and the overhead that makes workers wrong for tiny tasks.
