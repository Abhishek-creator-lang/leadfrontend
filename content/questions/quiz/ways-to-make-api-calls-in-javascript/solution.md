## TL;DR

In the browser the native options are **`fetch()`** (modern default), **`XMLHttpRequest`** (legacy, but still the only native way to get upload progress), **`navigator.sendBeacon()`** (fire-and-forget on page exit), plus non-request/response channels: **WebSocket**, **Server-Sent Events (`EventSource`)** and **WebTransport**. On top of those sit **libraries** (Axios, ky, ofetch) and **data-fetching layers** (TanStack Query, SWR, Apollo/urql for GraphQL, tRPC). Pick based on the communication pattern, not habit.

## Native request/response

```js
// fetch: promise-based, streams, AbortSignal
const res = await fetch('/api/items');
const items = await res.json();

// XMLHttpRequest: event-based, progress events
const xhr = new XMLHttpRequest();
xhr.open('POST', '/upload');
xhr.upload.onprogress = (e) => console.log(e.loaded / e.total);
xhr.onload = () => console.log(xhr.status);
xhr.send(formData);

// sendBeacon: queued POST that survives unload, no response
addEventListener('pagehide', () => {
  navigator.sendBeacon('/analytics', JSON.stringify(metrics));
});
```

`fetch(url, { keepalive: true })` is a `fetch`-based alternative to `sendBeacon` with more control over method and headers. Older techniques you'll still meet: **JSONP** (script-tag injection, obsolete since CORS) and HTML form submissions.

## Real-time / streaming

| API | Direction | Use case |
|---|---|---|
| `WebSocket` | Full duplex | Chat, multiplayer, collaborative editing |
| `EventSource` (SSE) | Server → client over HTTP | Notifications, live feeds, LLM token streaming |
| `fetch` with a `ReadableStream` body reader | Server → client | Streaming responses without SSE framing |
| WebTransport | Bidirectional, HTTP/3 | Low-latency, unreliable datagrams (games, media) |

## Libraries

- **Axios**: XHR-based in browsers (it can use a fetch adapter in newer versions). Interceptors, automatic JSON, throws on non-2xx, upload progress. Adds weight to the bundle.
- **ky / ofetch / wretch**: tiny wrappers around `fetch` with retries, timeouts, hooks and error-on-non-2xx.
- **GraphQL clients** (Apollo, urql, Relay): normalized caching and fragments.

## Data-fetching layers

Raw requests are only half the problem. Real apps need caching, deduplication, background refresh, retries, pagination and optimistic updates:

```js
const { data, error, isPending } = useQuery({
  queryKey: ['todos', filter],
  queryFn: ({ signal }) => fetch(`/api/todos?f=${filter}`, { signal }).then(r => r.json()),
});
```

TanStack Query, SWR or RTK Query handle server state so you don't rebuild it in Redux or `useEffect`. Meta-frameworks add server-side options too: React Server Components fetching on the server, Next.js/Remix loaders and server actions.

## How to choose

- Ordinary CRUD → `fetch` behind a small typed client, plus a query library in the UI.
- Upload with progress bar → XHR (or a library using it).
- Analytics on exit → `sendBeacon` / `keepalive`.
- Server pushes, client rarely sends → SSE (auto-reconnects, works through HTTP/2).
- Bidirectional, frequent messages → WebSocket.

## In an interview, mention…

- `fetch` vs XHR trade-offs (progress events, abort, streams, 4xx handling).
- That the real architecture question is server-state management, not which HTTP function to call.
- Push channels (SSE vs WebSocket) and their operational costs (connections, load balancers, reconnection).
- Cross-cutting concerns: auth tokens, error normalisation, retries with backoff, request cancellation.
