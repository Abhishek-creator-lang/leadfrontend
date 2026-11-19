## TL;DR

Frames talk through **`window.postMessage(message, targetOrigin)`**, which works across origins. The sender gets a reference to the other window (`iframe.contentWindow`, `window.parent`, `window.top`, `window.opener`), posts a structured-cloneable message, and the receiver listens for the **`message`** event. **Always pass an exact `targetOrigin` and verify `event.origin`** on receipt. For high-volume or request/response traffic, transfer a **`MessageChannel`** port. Same-origin frames can also access each other's DOM directly or use `BroadcastChannel`.

## Parent → iframe

```js
// parent page, https://app.example.com
const frame = document.querySelector('iframe#widget');
frame.addEventListener('load', () => {
  frame.contentWindow.postMessage(
    { type: 'init', theme: 'dark' },
    'https://widget.example.net'   // only deliver if the frame is still this origin
  );
});
```

## iframe → parent

```js
// inside https://widget.example.net
const PARENT_ORIGIN = 'https://app.example.com';

window.addEventListener('message', (event) => {
  if (event.origin !== PARENT_ORIGIN) return;         // ignore everyone else
  if (event.data?.type === 'init') applyTheme(event.data.theme);
});

window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, PARENT_ORIGIN);
```

`event.source` is the sender's window, so you can reply with `event.source.postMessage(…, event.origin)`.

## Request/response with MessageChannel

```js
// parent
const { port1, port2 } = new MessageChannel();
port1.onmessage = (e) => console.log('reply', e.data);
frame.contentWindow.postMessage({ type: 'connect' }, 'https://widget.example.net', [port2]);

// iframe
window.addEventListener('message', (e) => {
  if (e.origin !== PARENT_ORIGIN || e.data.type !== 'connect') return;
  const port = e.ports[0];
  port.onmessage = (m) => port.postMessage({ ok: true, echo: m.data });
});
```

A dedicated port avoids filtering every `message` event on `window` and gives you a private channel after a single origin check. Libraries like Comlink or Penpal build RPC on top of this.

## Security checklist

- **Never use `'*'` as `targetOrigin` for sensitive data.** If the frame navigated to another site, `*` would leak it.
- **Validate `event.origin`** with an exact match (not `includes` or `endsWith('example.com')`, which `evilexample.com` passes).
- **Treat `event.data` as untrusted input.** Validate its shape, never `eval` it or inject it as HTML.
- Use the `sandbox` attribute on untrusted iframes (`sandbox="allow-scripts"` without `allow-same-origin` gives it an opaque origin), and `allow` (Permissions Policy) to restrict features.
- Protect your own pages from being framed with `frame-ancestors` in CSP.

## Other options

| Method | When |
|---|---|
| Direct DOM access (`iframe.contentDocument`) | Same-origin only |
| `BroadcastChannel('name')` | Same-origin frames/tabs, pub/sub |
| `localStorage` + `storage` event | Same-origin tabs (legacy pattern) |
| URL fragment changes | Old cross-origin hack, avoid |

Data is copied with the structured clone algorithm: functions and DOM nodes can't be sent, while `ArrayBuffer`s and ports can be **transferred** (zero-copy).

## In an interview, mention…

- `postMessage` + `message` event, with exact `targetOrigin` and `event.origin` checks.
- `MessageChannel` for request/response, and RPC wrappers.
- Sandboxing and treating messages as untrusted input.
