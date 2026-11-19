## TL;DR

CSP is a response header that tells the browser which scripts, styles, frames and connections a page may use. Its main job is to **stop injected markup from executing script**, as a second line of defence after output encoding. Modern guidance favours a **strict CSP**: per-response **nonces** (or hashes) plus **`'strict-dynamic'`**, instead of brittle domain allow-lists, which are routinely bypassed through JSONP endpoints or script gadgets on allowed CDNs. Roll it out with **`Content-Security-Policy-Report-Only`**, collect violations, fix them, then enforce.

## A strict policy

```http
Content-Security-Policy:
  script-src 'nonce-R4nd0mPerResponse' 'strict-dynamic' https: 'unsafe-inline';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'self';
  report-to csp-endpoint
```

```html
<script nonce="R4nd0mPerResponse" src="/app.js"></script>
```

- **Nonce**: a fresh, unguessable value **per response**. An attacker's injected `<script>` doesn't have it, so it's blocked.
- **`'strict-dynamic'`**: scripts loaded *by* a trusted (nonced) script are trusted too. This makes bundler chunks and tag managers work without listing their hosts. In browsers that support it, host allow-lists and `'unsafe-inline'` are **ignored**, so `https:` and `'unsafe-inline'` are only fallbacks for very old browsers.
- **`object-src 'none'`** blocks plugin-based bypasses. **`base-uri 'none'`** stops `<base href>` injection from redirecting relative script URLs.
- **`frame-ancestors`** replaces `X-Frame-Options` for clickjacking defence. It can't be set via a `<meta>` tag.
- For **static or cached HTML** where you can't vary a nonce per response, use **hashes** (`'sha256-…'`) of inline scripts instead.

## Rollout plan for a legacy app

1. **Inventory**: inline `<script>` blocks, inline event handlers (`onclick=`), `javascript:` URLs, `eval`/`new Function` (including in libraries and some template engines), third-party tags.
2. **Ship Report-Only** with the target policy and a reporting endpoint. Expect noise from browser extensions; filter it out by source file.
3. **Refactor**: move inline handlers to `addEventListener`, add nonces through your SSR or edge layer, and remove `eval` usage (or accept `'unsafe-eval'` temporarily and track it as debt).
4. **Enforce** on a slice of traffic, watch error rates and violation reports, then go to 100%. Keep a Report-Only header for the *next*, tighter policy.
5. Add **`require-trusted-types-for 'script'`** later to harden DOM sinks (Chromium has supported Trusted Types for years, and other engines have been adding support, so check current coverage).

Reporting: `report-to` with a `Reporting-Endpoints` header is the modern mechanism. `report-uri` is deprecated but still more widely supported, so sending both is common.

## Other directives worth knowing

| Directive | Use |
|---|---|
| `connect-src` | Limit `fetch`/XHR/WebSocket destinations, which limits exfiltration |
| `img-src`, `style-src`, `font-src` | Tighter resource control. Style injection can still leak data, so lock it down where practical |
| `upgrade-insecure-requests` | Rewrites `http:` subresources to `https:` during migrations |
| `form-action` | Stops injected forms posting credentials elsewhere |
| `sandbox` | Applies iframe-like sandboxing to the page itself |

## Pitfalls

- Static nonces, or nonces cached in a CDN-cached page. That's equivalent to no nonce.
- `'unsafe-inline'` without a nonce or `'strict-dynamic'`, which defeats the point.
- Allow-listing big CDNs like `*.googleapis.com` that host JSONP or Angular-style gadgets.
- Treating CSP as the fix for XSS. It's mitigation; the bug is still there.
- Breaking third-party tags in production without a Report-Only phase.

## In an interview, mention…

- Strict CSP (nonce + `strict-dynamic`) vs allow-lists, and why allow-lists fail.
- The Report-Only → fix → enforce rollout and how you'd handle noisy reports.
- `frame-ancestors`, `base-uri`, `object-src` as the cheap must-haves.
- The edge or SSR layer as the place that generates nonces, and the conflict with full-page caching.
