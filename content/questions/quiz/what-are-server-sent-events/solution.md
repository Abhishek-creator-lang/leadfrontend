## TL;DR

**Server-sent events (SSE)** let a server **push a stream of text events to the browser over a single, long-lived HTTP response** (`Content-Type: text/event-stream`). The browser API is **`EventSource`**, which parses the stream, dispatches events and **reconnects automatically**, resuming with `Last-Event-ID`. SSE is **one-way (server → client)**, text only, and works through ordinary HTTP infrastructure, which makes it a simpler alternative to WebSockets for feeds, notifications, progress updates and streamed AI responses.

## Client

```js
const source = new EventSource('/api/notifications', { withCredentials: true });

source.onmessage = (e) => render(JSON.parse(e.data));      // events without a name
source.addEventListener('price', (e) => updatePrice(JSON.parse(e.data)));
source.onerror = () => {
  // fired on disconnect; the browser retries unless readyState is CLOSED
  if (source.readyState === EventSource.CLOSED) showOffline();
};

// stop listening
source.close();
```

## Wire format

Each event is a block of `field: value` lines ending with a blank line:

```
retry: 5000

id: 41
event: price
data: {"symbol":"ACME","value":12.5}

: this is a comment, often used as a keep-alive ping

id: 42
data: first line
data: second line
```

Fields: `data` (repeated lines are joined with `\n`), `event` (the event name; default `message`), `id` (stored and sent back as the `Last-Event-ID` header on reconnect) and `retry` (reconnect delay in ms).

## Server sketch (Node)

```js
app.get('/api/notifications', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (id, data) => res.write(`id: ${id}\ndata: ${JSON.stringify(data)}\n\n`);
  const ping = setInterval(() => res.write(': ping\n\n'), 15000);
  const unsubscribe = bus.subscribe(send, req.headers['last-event-id']);
  req.on('close', () => { clearInterval(ping); unsubscribe(); });
});
```

## SSE vs alternatives

| | SSE | WebSocket | Long polling |
|---|---|---|---|
| Direction | Server → client | Bidirectional | Server → client (simulated) |
| Protocol | Plain HTTP | Upgrade to `ws://` | Plain HTTP |
| Reconnect / resume | Built in | You implement it | You implement it |
| Data | UTF-8 text | Text and binary | Anything |
| Proxies / HTTP/2 | Works well, multiplexed | Separate connection | Works |

Client-to-server messages with SSE just use normal `fetch` POSTs.

## Pitfalls and limits

- **HTTP/1.1 connection limit:** browsers allow about 6 connections per origin, and each open `EventSource` uses one, across all tabs. Over HTTP/2 or HTTP/3 streams are multiplexed, so this mostly goes away. Serve SSE over HTTP/2.
- **No custom headers** in `EventSource` (e.g. `Authorization`). Use cookies, a short-lived token in the URL, or implement the stream with `fetch` and a `ReadableStream` reader. That's how most LLM chat UIs consume streamed responses, because they also need POST bodies.
- **Buffering proxies** (nginx, some CDNs, compression middleware) can hold events back. Disable buffering (`X-Accel-Buffering: no`) and send periodic comments as keep-alives.
- **Server cost:** each client holds an open connection, so the server must be async/event-driven.

## In an interview, mention…

- One-way push over HTTP with automatic reconnection and resume via event IDs.
- When it beats WebSockets (notifications, dashboards, token streaming) and when it doesn't (chat with high-frequency client messages, binary data, games).
- The connection limit on HTTP/1.1, the header limitation and the `fetch`-stream alternative.
