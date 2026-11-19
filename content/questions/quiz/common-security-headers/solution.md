## TL;DR

Security headers are HTTP response headers that **switch on browser protections**. The core set: **`Content-Security-Policy`** (limits script and resource sources; mitigates XSS, clickjacking via `frame-ancestors`), **`Strict-Transport-Security`** (HTTPS only), **`X-Content-Type-Options: nosniff`** (no MIME sniffing), **`Referrer-Policy`** (limits URL leakage), **`Permissions-Policy`** (disables powerful features), **`Cross-Origin-Opener-Policy`** / **`Cross-Origin-Embedder-Policy`** / **`Cross-Origin-Resource-Policy`** (cross-origin isolation and Spectre-style leaks), plus **`Set-Cookie` attributes** and **CORS** headers configured correctly.

## The headers

```http
Content-Security-Policy: script-src 'nonce-…' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-Frame-Options: DENY
```

| Header | Purpose | Notes |
|---|---|---|
| `Content-Security-Policy` | Allowlist sources; blocks injected scripts | Prefer nonce/hash-based; roll out with `-Report-Only` |
| `Strict-Transport-Security` | Browser refuses plain HTTP for this host for `max-age` seconds | Prevents SSL stripping; `preload` adds you to browsers' built-in list (hard to undo) |
| `X-Content-Type-Options: nosniff` | Use the declared `Content-Type`; don't guess | Stops uploaded "images" executing as scripts; blocks scripts/styles with wrong MIME |
| `Referrer-Policy` | How much of the URL is sent in `Referer` | `strict-origin-when-cross-origin` is the modern default; use `no-referrer` for sensitive pages |
| `Permissions-Policy` | Disable features (camera, mic, geolocation, payment…) for the page and its iframes | Limits what an XSS or compromised third party can use |
| `X-Frame-Options` | Legacy framing control (`DENY`/`SAMEORIGIN`) | Superseded by CSP `frame-ancestors`; send both for older clients |
| `Cross-Origin-Opener-Policy` | Separates your window from cross-origin popups/openers | Mitigates XS-Leaks and tabnabbing; required (with COEP) for `SharedArrayBuffer` |
| `Cross-Origin-Embedder-Policy` | Only load cross-origin resources that opt in | `require-corp` or `credentialless`; enables cross-origin isolation |
| `Cross-Origin-Resource-Policy` | Who may embed *your* resources | `same-origin`/`same-site` protects images, scripts and APIs from cross-site inclusion |

## Related headers and attributes

- **Cookies**: `Set-Cookie: __Host-sid=…; Secure; HttpOnly; SameSite=Lax; Path=/`. `HttpOnly` blocks JS access, `Secure` requires HTTPS, `SameSite` limits CSRF.
- **CORS** (`Access-Control-Allow-Origin` etc.): not a protection by itself but a relaxation of the same-origin policy. Never reflect arbitrary origins with credentials allowed.
- **`Cache-Control: no-store`** on responses with personal data.
- **`Clear-Site-Data: "cache", "cookies", "storage"`** on logout to wipe client state.
- **Reporting**: `Reporting-Endpoints` with CSP `report-to`, plus COOP/COEP reporting, to observe violations.
- **Deprecated**: `X-XSS-Protection` (old XSS auditors were removed and could introduce leaks; set `0` or omit), `Expect-CT`, `Public-Key-Pins` (dangerous, removed).

## Practical advice

- Set headers centrally: CDN/edge config, reverse proxy (nginx), or middleware (Helmet for Express, `headers()` in Next.js config).
- Apply them to **all** responses, including error pages and static assets, not just HTML.
- Start strict for new apps; for existing ones, add `nosniff`, HSTS (short `max-age` first), `Referrer-Policy` and framing protection immediately, then iterate on CSP in report-only mode.
- Verify with browser DevTools (Network → Headers, Console CSP errors), automated checks in CI, and scanners such as Mozilla's HTTP Observatory.

## In an interview, mention…

- What each core header prevents (XSS, downgrade, sniffing, leakage, feature abuse, clickjacking, cross-origin leaks).
- CSP and HSTS as the highest-value pair, and the `preload` commitment.
- Deprecated headers you shouldn't rely on, and how you'd deploy and monitor headers across environments.
