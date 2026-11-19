## TL;DR

Assume **everything sent to the browser is public**: users (and malware, extensions, XSS payloads) can read your bundle, network traffic in DevTools, storage and memory. So: **never put secrets in client code**, **minimise** the sensitive data you send, keep **session credentials in `HttpOnly; Secure; SameSite` cookies** rather than `localStorage`, use **HTTPS everywhere** (HSTS), **don't log or cache** sensitive data, **clear it** when it's no longer needed, and harden against **XSS**, because XSS can read anything JavaScript can.

## 1. Secrets don't belong in the front end

```js
// ✗ shipped to every visitor, visible in the bundle and network tab
const stripe = new Stripe('sk_live_…');
fetch('https://api.openai.example/v1', { headers: { Authorization: `Bearer ${import.meta.env.VITE_SECRET}` } });
```

- Build-time env vars (`VITE_*`, `NEXT_PUBLIC_*`, `REACT_APP_*`) are **inlined into the bundle**. Only public, publishable keys belong there.
- Call third-party APIs that need secrets **from your server** (BFF, serverless function) and expose only what the client needs.
- Keep `.env` files out of git; scan for leaked keys (GitHub secret scanning, gitleaks) and rotate immediately if one leaks.
- Source maps in production can expose internal code and comments; upload them privately to your error tracker instead of serving them publicly, if that matters for you.

## 2. Send and keep less

- **Data minimisation**: APIs should return only fields the view needs (no full user records with password hashes, internal flags or other users' data). Filtering on the client is not access control.
- Don't put sensitive data in **URLs** (query strings end up in logs, history, `Referer` headers and analytics). Use POST bodies or headers, and set `Referrer-Policy: strict-origin-when-cross-origin` (or stricter).
- Mask or truncate where possible (last 4 digits of a card).

## 3. Storing tokens and personal data

| Storage | Readable by JS (and XSS) | Sent automatically | Notes |
|---|---|---|---|
| `HttpOnly` cookie | No | Yes (needs CSRF protection) | Best for session/refresh tokens |
| Memory (variable/closure) | Yes, while page lives | No | Good for short-lived access tokens |
| `sessionStorage` | Yes | No | Per-tab, cleared when the tab closes |
| `localStorage` / IndexedDB | Yes | No | Persists indefinitely; avoid for credentials |

```http
Set-Cookie: __Host-session=…; Path=/; Secure; HttpOnly; SameSite=Lax
```

The `__Host-` prefix forces `Secure`, `Path=/` and no `Domain`, preventing subdomain overrides. For SPAs, the **backend-for-frontend (BFF)** pattern keeps OAuth tokens on the server and gives the browser only a session cookie.

If you must persist sensitive data offline, encrypt it with Web Crypto (`crypto.subtle`) using a non-extractable key, and understand that this mainly protects data at rest, not against XSS running in the page.

## 4. Transport

- HTTPS only, with `Strict-Transport-Security`. No mixed content.
- `Cache-Control: no-store` on responses with personal data so they aren't stored by browsers or shared caches.
- Use `crypto.getRandomValues()`/`crypto.randomUUID()`, never `Math.random()`, for anything security-related.

## 5. Forms and UI

- Correct `autocomplete` values (`current-password`, `new-password`, `one-time-code`, `cc-number`) help password managers; `autocomplete="off"` on passwords mostly hurts users.
- Don't keep card data in your JS at all: use the payment provider's hosted fields/iframes so it never touches your origin (also reduces PCI scope).
- Clear sensitive form state after submission and on logout; clear caches (query client, stores, IndexedDB) on logout and on account switch.

## 6. Logging, analytics and error tracking

- Scrub PII and tokens before sending to Sentry/analytics (`beforeSend` hooks, deny-lists for fields like `password`, `authorization`).
- Session-replay tools must mask inputs and sensitive text.
- Don't `console.log` user objects in production.

## 7. Protect the page itself

XSS gives attackers everything JavaScript can reach, so the controls above depend on XSS defences: output encoding, strict CSP, Trusted Types, dependency hygiene, and **Subresource Integrity** for third-party scripts (or self-host them). Limit third-party scripts on pages with sensitive data (login, checkout).

## In an interview, mention…

- "The client is public": no secrets in bundles, server-side proxies for secret-requiring APIs.
- Token storage trade-offs and why `HttpOnly` cookies or a BFF are preferred.
- Minimisation, no sensitive data in URLs/logs/caches, scrubbing telemetry.
- XSS as the threat that undermines all client-side protections.
