## TL;DR

**Long polling** keeps an HTTP request open until the server has news, then the client immediately asks again. It works everywhere but has overhead and latency gaps. **Server-Sent Events** (`EventSource`) are a **one-way, server-to-client stream over plain HTTP**, with built-in reconnection and resume via `Last-Event-ID`. They're great for notifications, feeds, progress and streamed LLM output. **WebSockets** are a **full-duplex, low-overhead** channel after an HTTP upgrade, for chat, collaboration, multiplayer and anything chatty in both directions. Choose by **direction of traffic, message rate, infrastructure and operational cost**, not by what feels most "real-time".

## Comparison

| | Long polling | SSE | WebSocket |
|---|---|---|---|
| Direction | Server → client (client sends normal requests) | Server → client | Bidirectional |
| Protocol | HTTP | HTTP (`text/event-stream`) | `ws://`/`wss://` after HTTP Upgrade |
| Data | Anything | UTF-8 text (JSON) | Text or binary |
| Reconnect / resume | Manual | **Automatic**, `retry:` and `Last-Event-ID` | Manual (backoff, resubscribe, replay) |
| Proxies, CDNs, auth | Works everywhere, cookies work | Works with HTTP infra; must disable response buffering | Needs Upgrade support and sticky or stateful routing |
| Per-message overhead | Full HTTP request | Small | Very small (2–14 byte frames) |
| Browser limits | Connection pool | ~6 per origin on HTTP/1.1 (shared across tabs); multiplexed on HTTP/2 | Separate connections |

## Code shape

```js
// SSE: reconnection and resume are built in
const es = new EventSource('/api/orders/stream', { withCredentials: true });
es.addEventListener('order-updated', e => update(JSON.parse(e.data)));
es.onerror = () => { /* browser retries automatically */ };
```

```js
// WebSocket: you own the protocol
function connect(attempt = 0) {
  const ws = new WebSocket('wss://rt.example.com/rooms/42');
  ws.onopen = () => { attempt = 0; ws.send(JSON.stringify({ type: 'resume', since: lastSeq })); };
  ws.onmessage = e => apply(JSON.parse(e.data));
  ws.onclose = () => setTimeout(() => connect(attempt + 1),
    Math.min(30000, 500 * 2 ** attempt) * (0.5 + Math.random())); // jittered backoff
}
```

`EventSource` can't set custom headers, so authentication relies on cookies or a token in the URL (which leaks into logs). Many teams use `fetch()` with a streaming body reader instead, to get headers and `POST` while keeping SSE's wire format. That's how most LLM chat UIs stream tokens.

## Choosing

- **Mostly server pushes, occasional client actions** (dashboards, notifications, order status, AI token streaming): **SSE**, with client actions as normal `fetch` calls. Simpler to scale and debug, and it works with HTTP/2 multiplexing.
- **High-frequency bidirectional** (chat with typing indicators, collaborative editing, games, trading): **WebSocket**, possibly via a library or managed service that handles presence, rooms and fallbacks.
- **Rare updates or hostile networks**: plain polling or long polling. Polling every 30 s is often the right, boring answer.
- **Emerging**: **WebTransport** (over HTTP/3) offers multiple streams and unreliable datagrams. It's supported in Chromium and Firefox, and Safari support has been arriving, so check before relying on it.

## Senior-level concerns

- **Scaling stateful connections**: each socket pins memory on a server. Use a pub/sub backbone (Redis, NATS, Kafka) so any node can deliver any message, and drain connections gracefully on deploy.
- **Delivery semantics**: sequence numbers, idempotent handlers, and replay after reconnect. Networks drop silently, so add heartbeats (ping/pong) to detect dead connections.
- **Thundering herd** on server restart: jittered backoff.
- **Mobile and background tabs**: connections get suspended. Refetch state on `visibilitychange` or `online`.
- **Security**: validate `Origin` on WebSocket upgrades (no CORS applies; cross-site WebSocket hijacking is a real attack), authenticate per connection, and authorise per message.

## In an interview, mention…

- Direction and frequency as the deciding factors, with SSE as the underrated default for push.
- Reconnection, resume and ordering as the hard parts.
- Infrastructure: proxy buffering, sticky sessions, pub/sub fan-out.
- WebSocket `Origin` checks and the `EventSource` header limitation.
