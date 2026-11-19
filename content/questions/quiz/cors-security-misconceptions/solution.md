## TL;DR

The **same-origin policy** is the protection: by default a page can't *read* responses from other origins. **CORS is an opt-in way to relax it**, letting a server say "this origin may read my response". So CORS doesn't protect your API. A **misconfigured CORS policy removes protection**, and a correct one does nothing against attackers who don't use a victim's browser (curl, scripts, servers). Protect APIs with **authentication, authorisation, CSRF defences and rate limiting**. Treat CORS as a *read-permission* setting for browsers.

## Misconceptions, one by one

**1. "CORS blocks the request."**
Mostly it blocks *reading the response*. Simple requests (`GET`, or `POST` with form content types and no custom headers) **are sent and executed** by the server; the browser just hides the result. Only non-simple requests get a preflight `OPTIONS` that can stop the real request. Side effects from simple requests are a CSRF problem, not a CORS one.

**2. "CORS protects my API from other servers."**
Non-browser clients ignore CORS completely. Anyone can `curl` your API. CORS only governs what *browser JavaScript on other origins* may read using *the user's* browser and credentials.

**3. "Reflecting the Origin header is a convenient allow-all."**
```js
// Dangerous
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');
```
Now **any** site the user visits can make credentialed requests and read the user's private data. This is the classic real-world CORS vulnerability. The spec forbids `*` with credentials precisely to prevent this, and reflection bypasses that safeguard.

**4. "Regex allow-lists are fine."**
`/example\.com/` matches `example.com.evil.net` and `evilexample.com`. Use an exact-match set of full origins (scheme + host + port).

**5. "Allowing `null` is harmless."**
`Origin: null` is sent by sandboxed iframes, `file:` URLs and some redirects, and an attacker can produce it on demand with `<iframe sandbox="allow-scripts">`. Never allow-list `null` with credentials.

**6. "Trusting all our subdomains is safe."**
`*.example.com` trust means any XSS or takeover on a forgotten subdomain can read your API. Keep the list tight.

**7. "CORS errors are a server bug, so add the headers until it works."**
Sometimes the right answer is a same-origin proxy or BFF, which keeps tokens server-side and avoids cross-origin entirely.

## A correct configuration

```js
const ALLOWED = new Set(['https://app.example.com', 'https://admin.example.com']);

function cors(req, res, next) {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin'); // caches must not mix responses across origins
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
    return res.sendStatus(204);
  }
  next();
}
```

Note **`Vary: Origin`**. Without it a CDN may cache a response with one origin's ACAO header and serve it to another, causing either breakage or leakage.

## Related browser protections worth naming

- **CORB/ORB** stop cross-origin `<img>`/`<script>` loads from pulling sensitive JSON or HTML into a renderer process.
- **CORP** (`Cross-Origin-Resource-Policy`) lets a resource refuse to be embedded cross-origin.
- **COOP/COEP** isolate browsing contexts; they're required for `SharedArrayBuffer`.
- **Private Network Access** (Chromium) restricts public sites from making requests into private networks (routers, localhost); the details are still evolving.

## In an interview, mention…

- SOP protects; CORS relaxes. Simple requests still execute on the server.
- Origin reflection with credentials and `null` origins as the top real-world bugs.
- `Vary: Origin`, exact-match allow-lists, and that server-side auth is the real API protection.
