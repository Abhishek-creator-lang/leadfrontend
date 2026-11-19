## TL;DR

**Subresource Integrity** lets you pin a script or stylesheet to a cryptographic hash: `<script src="…" integrity="sha384-…" crossorigin="anonymous">`. If the CDN serves different bytes, whether compromised or just updated, the browser **refuses to run it**. SRI is ideal for **versioned, immutable files** on a public CDN. It doesn't work for "evergreen" vendor tags (analytics, chat, A/B testing) whose content changes without notice. Those need **self-hosting, sandboxing, CSP and vendor governance** instead.

## How it works

```html
<script
  src="https://cdn.example.net/lib@4.2.1/lib.min.js"
  integrity="sha384-BASE64_DIGEST_OF_THE_EXACT_FILE_BYTES"
  crossorigin="anonymous"></script>
```

- The browser hashes the response and compares it with the `integrity` value (SHA-256, -384 or -512). You can list several hashes to allow a transition between versions.
- **`crossorigin` is required** for cross-origin resources. The response must be CORS-enabled (`Access-Control-Allow-Origin`), otherwise the check fails and the script is blocked.
- Generate the hash in your build (`openssl dgst -sha384 -binary lib.min.js | openssl base64 -A`), or let your bundler's SRI plugin add it to emitted tags.
- SRI applies to `<script>` and `<link rel="stylesheet">` and to preloads. For module graphs, an **import map `integrity` field** is supported in recent Chromium and Safari versions, so check support.
- The `require-sri-for` CSP directive was never shipped widely. Don't rely on it.

## Why it matters: real incidents

- **British Airways (2018)**: attackers modified a third-party script used on the payment page, skimming card data. The UK regulator imposed a large fine.
- **polyfill.io (2024)**: a popular polyfill CDN domain changed ownership and began serving malicious redirects to some visitors. Any site that hot-linked it ran attacker code. SRI wasn't possible because responses varied per user agent, which is exactly why the guidance was to self-host.
- Magecart-style skimmers in general target checkout pages via compromised third-party tags.

## Managing third-party scripts (where SRI doesn't fit)

| Strategy | Effect |
|---|---|
| **Self-host** pinned versions | You control the bytes, and SRI becomes unnecessary for same-origin files |
| **Inventory and ownership** | Every tag has an owner, purpose, data access review and removal date |
| **CSP** with `strict-dynamic` and tight `connect-src` | Limits where injected code can send data |
| **Isolate in a sandboxed iframe** on another origin | The vendor can't read your DOM, cookies or form fields |
| **Web Worker sandboxes** (e.g. Partytown-style approaches) | Moves tag execution off the main thread; isolation is limited since the DOM is proxied |
| **Keep sensitive pages clean** | No marketing tags on checkout, login or account settings pages |
| **Tag manager governance** | Restrict who can publish custom HTML tags, with review and audit logs |
| **Runtime monitoring** | CSP violation reports, client-side script-change detection |

PCI DSS v4 now explicitly requires an inventory and integrity verification of scripts on payment pages, which pushes many teams to formalise this.

## Pitfalls

- Adding SRI to a URL whose content changes (`/latest/`), so the site breaks on the vendor's next deploy.
- Forgetting `crossorigin`, or a CDN without CORS headers, which silently blocks the script.
- Believing SRI protects against a compromised npm package bundled into your own JS. That's a supply-chain problem solved at build time.

## In an interview, mention…

- How SRI works, the `crossorigin` requirement and where it fits (immutable, versioned assets).
- A real incident (British Airways, polyfill.io) and the lesson: self-host and govern.
- Isolation options and keeping payment and auth pages free of third-party code.
