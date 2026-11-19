## TL;DR

**Cross-site request forgery** tricks a logged-in user's browser into sending a state-changing request to your site. The browser attaches the session cookie automatically, so the server thinks the user meant it. **`SameSite=Lax`** (which Chromium applies by default to cookies without a `SameSite` attribute) blocks cookies on cross-site subrequests and cross-site `POST`s, which kills most classic CSRF. But it's **not sufficient alone**: browser defaults differ, **same-site isn't same-origin** (a compromised or user-content subdomain is "same-site"), and **state-changing `GET`s are still exposed**. Set `SameSite` explicitly and add a server-side check: a **CSRF token** or a **`Sec-Fetch-Site`/`Origin` check**.

## The attack

```html
<!-- on evil.example -->
<form action="https://bank.example/transfer" method="POST">
  <input name="to" value="attacker"><input name="amount" value="5000">
</form>
<script>document.forms[0].submit()</script>
```

The attacker can't *read* the response (same-origin policy). They don't need to; the side effect is the goal. Note that CORS doesn't stop this: simple form posts don't trigger a preflight.

## SameSite modes

| Value | Cookie sent on cross-site requests? |
|---|---|
| `Strict` | Never, not even when following a link from another site (users land logged out) |
| `Lax` | Only on **top-level navigations with safe methods** (clicking a link, `GET`) |
| `None` | Always. Requires `Secure`. Needed for embedded third-party contexts |

Defaults vary. **Chromium treats a missing `SameSite` as `Lax`** (with a short "Lax+POST" grace window for freshly set cookies, to keep some SSO flows working). Firefox and Safari don't apply the same default, though Safari's tracking prevention and Firefox's Total Cookie Protection restrict third-party cookies in other ways. So **always set the attribute explicitly**.

### Same-site ≠ same-origin

"Site" is the scheme plus registrable domain (eTLD+1). `https://evil.bank.example` and `https://app.bank.example` are **same-site**, so SameSite does nothing against an attacker who controls a sibling subdomain (user-hosted pages, a forgotten marketing subdomain, subdomain takeover).

## Robust defences (layer them)

1. **`SameSite=Lax` or `Strict`** on session cookies, plus `Secure; HttpOnly`. Consider the `__Host-` prefix, which forces `Secure`, `Path=/` and no `Domain` attribute, so sibling subdomains can't set or overwrite it.
2. **Never change state on `GET`.**
3. **Fetch Metadata check** on the server: reject unsafe-method requests whose `Sec-Fetch-Site` is `cross-site` (and, if you're strict, `same-site`). All modern browsers send it. Fall back to checking `Origin` against an allow-list when the header is missing.
4. **Synchronizer token** (per-session or per-request, stored server-side) or **signed double-submit cookie**, sent in a header or hidden field. Classic, framework-supported, works everywhere.
5. **Custom request headers** for JSON APIs (e.g. `X-Requested-With`): cross-site forms can't set them, and cross-origin `fetch` with them triggers a preflight you won't approve. Combine with strict `Content-Type: application/json` checks.

```js
// Express-style middleware sketch
function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const site = req.get('Sec-Fetch-Site');
  if (site && site !== 'same-origin' && site !== 'none') return res.sendStatus(403);
  if (!site && !ALLOWED_ORIGINS.has(req.get('Origin'))) return res.sendStatus(403);
  next();
}
```

## Third-party cookie context

Chrome abandoned its plan to remove third-party cookies, but Safari and Firefox block or partition them by default, and **CHIPS** (`Partitioned` cookies) is the supported way to have per-top-site embedded cookies. None of this replaces CSRF defences for first-party sessions.

## Pitfalls

- "We use JWT in `localStorage`, so CSRF doesn't apply." True for CSRF, but now any XSS can steal the token, which is a worse trade.
- Login CSRF (forcing the victim into the attacker's account) and logout CSRF are often forgotten.
- CORS misconfigurations with `credentials: true` and a reflected `Origin` re-open the door.

## In an interview, mention…

- Why the attack works (ambient credentials) and why CORS doesn't stop it.
- SameSite modes, the Chromium default, and same-site vs same-origin.
- Fetch Metadata + tokens as layered defences, and `__Host-` cookies.
