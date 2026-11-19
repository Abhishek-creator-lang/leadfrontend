## TL;DR

**Clickjacking** (UI redressing) loads your site in an **invisible or disguised iframe** on an attacker's page and lures the user into clicking something that actually lands on your UI: "Delete account", "Allow camera", "Confirm payment". The user's cookies make the click authenticated. The fix is to **stop untrusted sites from framing you**: send **`Content-Security-Policy: frame-ancestors 'self'`** (or an explicit list of partners), plus `X-Frame-Options: DENY`/`SAMEORIGIN` for older clients. JavaScript frame-busting is not a reliable defence.

## How the attack looks

```html
<!-- attacker page -->
<style>
  iframe { opacity: 0.0001; position: absolute; top: 120px; left: 40px; z-index: 2; }
  .bait  { position: absolute; top: 160px; left: 80px; z-index: 1; }
</style>
<button class="bait">Claim your prize</button>
<iframe src="https://victim.example/settings/delete-account" width="500" height="300"></iframe>
```

Variants: **cursorjacking** (a fake cursor offset from the real one), **likejacking** of social widgets, **drag-and-drop** to exfiltrate text, and **double-clickjacking**, which swaps windows between the two clicks of a double-click and doesn't need an iframe at all.

## Defences

| Control | Notes |
|---|---|
| `Content-Security-Policy: frame-ancestors 'none'` | No one may frame you. Best for apps that are never embedded |
| `frame-ancestors 'self' https://partner.example` | Allow-list specific embedders. Supports multiple origins and wildcards for subdomains |
| `X-Frame-Options: DENY` / `SAMEORIGIN` | Legacy header. Can't list multiple origins (`ALLOW-FROM` is obsolete and ignored by modern browsers). If both are sent, `frame-ancestors` wins in modern browsers |
| `SameSite=Lax/Strict` session cookies | A cross-site iframe doesn't get the cookie, so the framed page shows logged-out. Good defence in depth, but don't rely on it alone |
| Re-authentication or confirmation for dangerous actions | Re-enter password, a typed confirmation, step-up auth |

```http
Content-Security-Policy: frame-ancestors 'self'
X-Frame-Options: SAMEORIGIN
```

`frame-ancestors` **must be sent as an HTTP header**; it's ignored in a `<meta http-equiv>` CSP. Set it at the CDN or edge so every HTML response gets it, including error pages and legacy routes.

## When you *do* need to be embedded

- Allow-list known embedders via `frame-ancestors`, ideally per tenant, generated dynamically for customer-configured domains.
- Use `SameSite=None; Secure` (and possibly `Partitioned`) cookies deliberately, knowing Safari and Firefox restrict third-party cookies, or use token-based auth for the embed. The Storage Access API is the sanctioned way for an embed to request its unpartitioned cookies after a user gesture.
- Keep destructive actions out of the embeddable surface.

## Why JavaScript frame-busting isn't enough

```js
if (top !== self) top.location = self.location; // legacy
```

Attackers can neutralise it with `<iframe sandbox="allow-forms">` (which blocks top navigation) or by racing `onbeforeunload`. Headers are enforced by the browser before your code runs.

## Pitfalls

- Setting the header on the SPA shell but not on server-rendered sub-pages, OAuth consent screens or file previews.
- Using `X-Frame-Options: ALLOW-FROM`, which modern browsers ignore, so the page becomes frameable by anyone.
- Forgetting embedded payment or auth widgets you host for others.

## In an interview, mention…

- The mechanics (opacity, z-index, ambient cookies) and modern variants like double-clickjacking.
- `frame-ancestors` as the primary control, `X-Frame-Options` as fallback, and header-only delivery.
- How you'd support legitimate embedding safely.
