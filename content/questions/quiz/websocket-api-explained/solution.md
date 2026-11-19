## TL;DR

The **WebSocket API** opens a **persistent, full-duplex connection** between browser and server over a single TCP connection. It starts as an HTTP request with an `Upgrade: websocket` header; once the server answers `101 Switching Protocols`, both sides can send **messages (text or binary) at any time** with tiny framing overhead. It suits chat, live collaboration, games and trading dashboards, where polling would be wasteful or slow.

## Client API

```js
const ws = new WebSocket('wss://example.com/chat'); // always wss:// in production

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ type: 'join', room: 'general' }));
});

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data); // string, Blob or ArrayBuffer
  render(msg);
});

ws.addEventListener('close', (e) => console.log('closed', e.code, e.reason, e.wasClean));
ws.addEventListener('error', () => console.log('error, a close event follows'));

ws.binaryType = 'arraybuffer'; // default is 'blob'
ws.close(1000, 'done');
```

`readyState` is `CONNECTING (0)`, `OPEN (1)`, `CLOSING (2)` or `CLOSED (3)`. Calling `send()` while connecting throws, so queue messages until `open`. `bufferedAmount` tells you how much is still waiting to go out, which is useful for backpressure.

## How it works

1. Client sends `GET /chat` with `Upgrade: websocket`, `Connection: Upgrade`, `Sec-WebSocket-Key` and optionally `Sec-WebSocket-Protocol` (subprotocols).
2. Server answers `101` with `Sec-WebSocket-Accept` (a hash proving it understood the handshake).
3. The TCP connection now carries WebSocket frames: text, binary, ping/pong, close. Client-to-server frames are masked.

## What it doesn't give you (and you must build)

- **Reconnection.** Unlike `EventSource`, a closed socket stays closed. Implement exponential backoff with jitter, and resubscribe after reconnecting.
- **Heartbeats.** Proxies and load balancers kill idle connections. Send app-level pings, or rely on server pings, to detect dead peers.
- **Message semantics.** No request/response correlation, acknowledgements, ordering guarantees after reconnect, or replay. Add message IDs, sequence numbers and a "resume from" cursor.
- **Auth.** Browsers can't set custom headers on the handshake. Use cookies (and check `Origin` on the server, because cookie-authenticated WebSockets are vulnerable to cross-site WebSocket hijacking), or send a short-lived token in the first message or the URL.
- **Backpressure.** The classic API has none; `WebSocketStream` (stream-based, Chromium) and WebTransport address this.

## WebSocket vs alternatives

| | WebSocket | SSE | Long polling |
|---|---|---|---|
| Direction | Bidirectional | Server → client | Request/response |
| Transport | Upgraded TCP connection | Plain HTTP (works with HTTP/2 multiplexing) | HTTP |
| Auto-reconnect | No | Yes | N/A |
| Binary | Yes | Text only | Yes |

If the client only listens, SSE is simpler. Scaling WebSockets needs sticky sessions or a pub/sub backbone (Redis, NATS) so messages reach users connected to other nodes.

## In an interview, mention…

- Handshake via HTTP Upgrade, then framed full-duplex messages.
- Reconnection, heartbeat and resubscription logic you own.
- Auth and `Origin` checking, `wss://` only.
- When SSE or plain polling is the better trade-off, and the server-side scaling story.
