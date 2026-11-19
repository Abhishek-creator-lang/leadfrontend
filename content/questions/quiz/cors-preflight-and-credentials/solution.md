## TL;DR

A cross-origin request is **"simple"** (no preflight) only when it uses `GET`, `HEAD` or `POST`, sets only CORS-safelisted headers, and (for `POST`) uses `Content-Type` `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`. **Anything else**, such as `PUT`/`DELETE`/`PATCH`, `Content-Type: application/json`, or `Authorization` and custom headers, triggers an **`OPTIONS` preflight** asking the server's permission first. For **credentialed** requests (cookies, HTTP auth), the client must opt in with `credentials: 'include'` and the server must reply with an **exact origin** (not `*`) plus `Access-Control-Allow-Credentials: true`.

## The preflight exchange

```http
OPTIONS /api/orders/42 HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, PUT, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Vary: Origin
```

Only if the preflight passes does the browser send the real `PUT`. The **actual response** must also carry `Access-Control-Allow-Origin` (and `-Credentials` if relevant), or JavaScript can't read it.

## Credentials

```js
fetch('https://api.example.com/me', { credentials: 'include' });
```

| Client `credentials` | Cookies sent cross-origin? | Server requirements |
|---|---|---|
| `omit` | No | — |
| `same-origin` (default for `fetch`) | No | — |
| `include` | Yes (subject to `SameSite` and third-party cookie rules) | ACAO = exact origin, `Access-Control-Allow-Credentials: true`; no `*` in Allow-Headers or Allow-Methods either |

Even with correct CORS, **cookies may not be sent**. A cookie needs `SameSite=None; Secure` to travel on cross-site requests, and Safari and Firefox block or partition third-party cookies by default. So an API on a different *site* (not just a different subdomain) usually shouldn't depend on cookies. Put it on the same site (`api.example.com` vs `app.example.com` is same-site) or use token auth or a BFF proxy.

## Performance

- Each preflight is an extra round trip. `Access-Control-Max-Age` caches the result, but browsers cap it (Chromium at 2 hours, Firefox at 24 hours).
- The preflight cache is keyed per origin + URL, so APIs with IDs in the path (`/orders/1`, `/orders/2`) get a preflight per URL.
- Ways to avoid preflights: same-origin routing (a reverse proxy at `/api`), or keeping requests simple where it's safe. Don't drop `Content-Type: application/json` checks just to avoid preflights, since that check is part of your CSRF defence.

## Debugging checklist

1. The DevTools Network tab shows the `OPTIONS` request separately. Check its status (it must be 2xx) and headers.
2. Auth middleware rejecting `OPTIONS` with 401 is the classic bug. Preflights never carry credentials.
3. Error responses (4xx/5xx from the real request) often lack CORS headers because error middleware runs first. Then the browser reports a CORS error that hides the real problem.
4. Redirects on preflight requests aren't followed.
5. Custom response headers aren't readable by JS unless listed in `Access-Control-Expose-Headers`.
6. `mode: 'no-cors'` doesn't fix anything. It gives you an **opaque** response you can't read.

## In an interview, mention…

- The exact simple-request rules, and that JSON and `Authorization` always preflight.
- Credentials needs exact origin + Allow-Credentials, and cookies also need `SameSite=None; Secure` plus third-party-cookie reality.
- `Vary: Origin`, `Max-Age` caps, and the "auth middleware blocks OPTIONS" incident.
- Same-origin proxying as the architectural alternative.
