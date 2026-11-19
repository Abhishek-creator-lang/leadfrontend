## TL;DR

There's no option that survives XSS. If an attacker runs script in your origin, they can **act as the user** whatever you choose. The choice decides whether they can also **steal a long-lived credential and use it elsewhere**. `localStorage` makes theft trivial. **`HttpOnly; Secure; SameSite` cookies** can't be read by JavaScript but bring back CSRF, which is manageable. The strongest pattern for SPAs is a **Backend-for-Frontend (BFF)**: the browser holds only an HttpOnly session cookie, and OAuth tokens never reach JavaScript. If the SPA must hold tokens itself, keep **short-lived access tokens in memory** and **rotate refresh tokens**.

## The options

| Storage | Readable by XSS? | Sent automatically (CSRF)? | Survives reload? | Notes |
|---|---|---|---|---|
| `localStorage` / `sessionStorage` | **Yes**, exfiltrated in one line | No | Yes / per tab | Simplest and most fragile. A single XSS or a malicious npm dependency leaks every user's token |
| JS memory (closure, module variable) | Harder: the attacker must hook your code while the page is open | No | No, needs a silent refresh | Good for short-lived access tokens |
| `HttpOnly` cookie | No | **Yes**, so add CSRF defences | Yes | Server-controlled expiry, `__Host-` prefix, works with SSR |
| Service worker or Web Worker holding the token | Isolated from page JS, but XSS can still ask the worker to make requests | No | Worker lifetime | Defence in depth, adds complexity |
| BFF session | Only an opaque session cookie | Yes, add CSRF defences | Yes | Tokens stay server-side; the IETF browser-based-apps guidance recommends this |

## Recommended architectures

**1. BFF (preferred for sensitive apps)**
```
Browser --(HttpOnly __Host-session cookie)--> BFF --(access token)--> APIs
```
The BFF does the OAuth code flow as a confidential client, stores the tokens, and proxies API calls. The browser never sees a JWT. Add `SameSite=Lax/Strict` plus Fetch Metadata or token CSRF checks.

**2. SPA holding tokens**
- Authorization Code + **PKCE** (the implicit flow is deprecated).
- Access token: short TTL (5–15 min), **in memory only**.
- Refresh token: **rotated on every use** with reuse detection. Ideally keep it in an HttpOnly cookie scoped to the token endpoint (`Path=/auth/refresh`) instead of in JS.
- On reload, call the refresh endpoint to get a new access token.

```js
let accessToken = null; // module scope, never persisted

export async function authFetch(url, opts = {}) {
  if (!accessToken) accessToken = await refresh();
  let res = await fetch(url, withAuth(opts, accessToken));
  if (res.status === 401) {
    accessToken = await refresh();
    res = await fetch(url, withAuth(opts, accessToken));
  }
  return res;
}
```

## JWT-specific pitfalls

- JWTs are **signed, not encrypted** by default. Don't put personal data in them.
- Statelessness makes **revocation** hard. Use short expiries plus server-side refresh-token revocation.
- Validate `alg` on the server (reject `none`, pin the expected algorithm), plus `aud`, `iss` and `exp`.
- Big JWTs in cookies can exceed header limits.

## Other pitfalls

- Treating "HttpOnly" as XSS-proof. It prevents theft, not misuse during the session.
- Long-lived tokens in `localStorage` "for convenience".
- Logging tokens in URLs, analytics or error trackers. Scrub `Authorization` headers in Sentry-style tools.
- Forgetting third-party scripts: any script you include has the same power as XSS.

## In an interview, mention…

- That the question is really XSS-theft vs CSRF exposure, and neither storage stops in-session misuse.
- BFF as the gold standard, and in-memory access token + rotated refresh token as the SPA fallback.
- PKCE, short TTLs, `__Host-` cookies, and CSP to reduce XSS likelihood in the first place.
