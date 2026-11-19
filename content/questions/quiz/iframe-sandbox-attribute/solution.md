## TL;DR

An empty **`sandbox` attribute** makes an iframe's content as powerless as possible: no scripts, no forms, no popups, no top-level navigation, and an **opaque origin** so it can't touch cookies, storage or same-origin APIs. You add capabilities back one token at a time (`allow-scripts`, `allow-forms`, …). For truly untrusted content, such as user HTML, ads, plugins or code playgrounds, combine sandboxing with **serving the content from a separate origin**, a restrictive **`allow` (Permissions Policy)** attribute and a narrow **`postMessage` protocol**.

## The tokens that matter

| Token | Grants | Risk |
|---|---|---|
| *(none)* | Static rendering only | — |
| `allow-scripts` | JavaScript runs | Needed for most widgets |
| `allow-same-origin` | Keeps the content's **real** origin (cookies, storage) | **Dangerous with `allow-scripts` if the frame is same-origin with the parent** |
| `allow-forms` | Form submission | Phishing forms |
| `allow-popups` / `allow-popups-to-escape-sandbox` | `window.open`, `target=_blank`; the second lets popups run unsandboxed | Popups can lead to malicious pages |
| `allow-top-navigation-by-user-activation` | Navigate the parent page, but only after a click | Prefer it over `allow-top-navigation` |
| `allow-modals`, `allow-downloads`, `allow-storage-access-by-user-activation` | Specific features | Grant only when needed |

### The classic trap

```html
<!-- Same-origin content with both tokens can remove its own sandbox -->
<iframe src="/user-content/123.html" sandbox="allow-scripts allow-same-origin"></iframe>
```

The framed script can reach `parent.document`, find the iframe element, delete the `sandbox` attribute and reload itself unsandboxed. It can also read your cookies and storage directly. **Never combine these two tokens for untrusted content on your own origin.**

## A robust pattern for user-generated or plugin content

```html
<iframe
  src="https://usercontent-sandbox.example-cdn.net/render/123"
  sandbox="allow-scripts allow-popups"
  allow="camera 'none'; microphone 'none'; geolocation 'none'"
  referrerpolicy="no-referrer"
  loading="lazy"
  title="User submitted widget"></iframe>
```

1. **Separate registrable domain** (not just a subdomain) so it's cross-site, cookies aren't shared, and `SameSite` protects your session. This is why Google uses `googleusercontent.com` and GitHub uses `githubusercontent.com`.
2. **`sandbox`** with the minimum tokens.
3. **`allow`** turns off powerful features (camera, payment, clipboard). Cross-origin iframes don't get most of them by default, but being explicit documents intent.
4. **`postMessage` contract**: validate `event.origin` and the message schema on both sides. With an opaque origin, `event.origin` is the string `"null"`, so validate `event.source === iframe.contentWindow` instead.
5. The framed origin also sends its own **CSP** (e.g. `connect-src` limits) and `frame-ancestors` restricted to your app.

`srcdoc` is handy for small snippets, but `srcdoc` content inherits the parent's origin unless sandboxed, so always sandbox it (without `allow-same-origin`) when the content is untrusted.

## Other isolation tools

- **CSP `sandbox` directive**: the framed *server* can force sandboxing on itself, even when loaded directly.
- **COOP/COEP** isolate browsing context groups (and are needed for `SharedArrayBuffer`).
- **Web Workers** for running untrusted *logic* without DOM access. Note they still have the page's origin, so they're not a security boundary for secrets.
- **Shadow DOM is not a security boundary.** It only isolates styles and DOM queries.

## Pitfalls

- `sandbox="allow-scripts allow-same-origin"` on same-origin content.
- Trusting `postMessage` from `*` or sending sensitive data with target origin `'*'`.
- Forgetting `title` on iframes (accessibility).
- Assuming a subdomain is "separate enough". It's same-site, and cookie scoping can leak.

## In an interview, mention…

- Default-deny sandbox, add tokens deliberately, and the self-unsandboxing trap.
- Separate domain + sandbox + Permissions Policy + validated `postMessage` as the full pattern.
- Real-world precedent (`*usercontent.com` domains) and that Shadow DOM isn't isolation.
