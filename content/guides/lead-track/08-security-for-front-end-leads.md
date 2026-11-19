---
title: Security for front end leads
description: The front end threat model and the controls a lead should own, including XSS and CSP, auth token handling, CSRF, supply-chain risk, third-party scripts, and security in RSC/Server Functions.
source: original
---
Front end security used to be "escape your output". Today the browser runs huge dependency trees, third-party scripts, auth flows, and in RSC frameworks, code that's part server. Leads are expected to know the threat model, set safe defaults, and build guardrails so that 50 engineers don't each have to be security experts.

## The front end threat model

| Threat | Example | Primary controls |
| --- | --- | --- |
| Cross-site scripting (XSS) | Injected script steals session or acts as user | Framework escaping, sanitization, CSP, Trusted Types |
| Cross-site request forgery (CSRF) | Malicious site triggers state-changing request with user's cookies | SameSite cookies, CSRF tokens, Origin checks |
| Token theft | Access token read from `localStorage` via XSS | httpOnly cookies / BFF pattern, short-lived tokens |
| Clickjacking | Your page framed and overlaid | `frame-ancestors` CSP / `X-Frame-Options` |
| Supply-chain compromise | Malicious npm package or compromised CDN script | Lockfiles, audits, provenance, SRI, minimal deps |
| Third-party script abuse | Tag manager script skims payment forms | Script governance, CSP, isolation (iframes) for sensitive flows |
| Sensitive data exposure | Secrets in bundles, PII in logs/analytics | Env var allowlists, scrubbing, reviews |
| Open redirects | `?next=https://evil.com` | Allowlist redirect targets |
| Server Function abuse (RSC) | Calling a server action directly with crafted input | Authn/authz + validation in every function |

## XSS

### What frameworks protect

React escapes text content and attribute values by default. Most XSS in React apps comes through **escape hatches**:

| Escape hatch | Risk | Safe approach |
| --- | --- | --- |
| `dangerouslySetInnerHTML` | Raw HTML injection | Sanitize with DOMPurify (configured allowlist), ideally server-side too |
| `href={userInput}` | `javascript:` URLs | Validate protocol (`https:`, `mailto:`), use URL parsing |
| Direct DOM APIs (`innerHTML`, `insertAdjacentHTML`) | Bypasses React | Lint ban; use `textContent` |
| Markdown renderers | Embedded HTML | Disable raw HTML or sanitize output |
| `eval`, `new Function`, `setTimeout(string)` | Code injection | Ban via lint and CSP (no `unsafe-eval`) |
| SSR state serialization | `</script>` injection in inline JSON | Use framework serializers or escape `<` |

```ts
function safeHref(input: string): string | undefined {
  try {
    const url = new URL(input, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
```

### Content Security Policy

A strict CSP is the strongest XSS mitigation layer:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'nonce-{random}' 'strict-dynamic';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
  img-src 'self' https://cdn.example.com data:;
  connect-src 'self' https://api.example.com;
  report-to csp-endpoint;
```

- Prefer **nonce-based** (or hash-based) `script-src` with `'strict-dynamic'` over long domain allowlists, which are often bypassable.
- Roll out with `Content-Security-Policy-Report-Only` first, collect reports, fix violations, then enforce.
- Frameworks (Next.js middleware, etc.) can inject per-request nonces. Static hosting needs hashes.

### Trusted Types

Supported in Chromium-based browsers (and more recently other engines), Trusted Types makes DOM XSS sinks (`innerHTML`, etc.) reject plain strings unless they pass through a policy. Enforce with CSP `require-trusted-types-for 'script'`. It's great for large codebases because it turns "find every sink" into a compile-time-ish guarantee.

## Authentication and tokens

| Approach | Pros | Cons |
| --- | --- | --- |
| Session cookie (httpOnly, Secure, SameSite=Lax/Strict) | Not readable by JS; simple | CSRF considerations; same-site API or BFF needed |
| BFF pattern: server holds OAuth tokens, browser holds session cookie | Tokens never reach the browser; recommended by current OAuth browser-app guidance | Requires a server layer |
| Access token in memory + refresh via httpOnly cookie | Limits XSS exposure window | Complexity; still exposed to an active XSS |
| Token in `localStorage` | Simple | Any XSS can exfiltrate it. Avoid for sensitive apps. |

Guidance: for SPAs talking to your own APIs, prefer **cookie sessions or a BFF**. Use OAuth 2.0 Authorization Code + PKCE for third-party identity providers. Never implement implicit flow.

## CSRF

- `SameSite=Lax` (default in modern browsers) blocks most cross-site POSTs with cookies, but not all cases (same-site subdomains, top-level GET with side effects).
- Use anti-CSRF tokens or verify the `Origin` header for state-changing requests.
- Never perform state changes on GET.
- Server Functions in frameworks typically include Origin checks. Know your framework's guarantees, and don't disable them.

## Supply chain

The average front end app pulls in hundreds to thousands of transitive packages. Controls:

| Control | Detail |
| --- | --- |
| Lockfiles committed, `--frozen-lockfile` in CI | Reproducible installs |
| Automated updates (Renovate/Dependabot) with grouping | Patch quickly without chaos |
| Vulnerability and malware scanning | npm audit, Snyk, Socket, GitHub advisories |
| Limit install scripts | pnpm's `onlyBuiltDependencies` / allowlists; review packages that need postinstall |
| Package provenance | Prefer packages published with npm provenance/attestations |
| Minimize dependencies | Policy: new runtime dependency needs justification (size, maintenance, security) |
| SRI for CDN scripts | `integrity="sha384-…"` on third-party `<script>` tags with fixed versions |
| Release age delay | Wait a few days before adopting brand-new versions to reduce exposure to compromised releases |

Recent incidents of compromised popular npm packages (2024–2025) mean supply-chain controls are no longer optional at scale.

## Third-party scripts

Analytics, tag managers, chat widgets, and A/B tools run with full page privileges.

- Maintain an **inventory** with owners, purpose, data accessed, and loading strategy.
- Require security + performance review to add a script.
- Keep sensitive pages (checkout, login) **free of non-essential third parties**. PCI DSS v4 includes requirements around managing scripts on payment pages.
- Use CSP to restrict where scripts load from and where data can be sent (`connect-src`).

## Security headers checklist

| Header | Purpose |
| --- | --- |
| `Content-Security-Policy` | XSS, injection, framing |
| `Strict-Transport-Security` | Force HTTPS |
| `X-Content-Type-Options: nosniff` | Prevent MIME sniffing |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | Disable unused powerful features (camera, geolocation) |
| `Cross-Origin-Opener-Policy` | Isolate browsing context (and enable cross-origin isolation with COEP) |

## RSC and Server Functions

- Every `'use server'` function is a **public endpoint**. Authenticate, authorize, and validate (Zod) inside the function, never relying on the UI to restrict access.
- Don't pass secrets or full DB records as props to Client Components. Everything serialized is visible to the client. Use DTOs and the `server-only` package.
- Use framework "taint" APIs (React's experimental `taintUniqueValue`/`taintObjectReference`) where available to prevent accidental leaks.
- Keep the framework patched: RSC frameworks have had serious vulnerabilities disclosed, and timely upgrades are part of the control set.

## Building a secure-by-default culture

- Lint rules for dangerous APIs; codeowners review for security-sensitive files.
- Secure components in the design system: `SafeLink`, `SanitizedHtml`, `ExternalScript`.
- Threat modeling as part of RFCs for features handling auth, payments, user-generated content, or file uploads.
- Security champions per team; quarterly training with real examples from your codebase.
- Run a periodic external pentest and a bug bounty when mature.

## Interview framing

> "My approach is layered: framework defaults, lint rules that block unsafe sinks, a sanitized-HTML component as the only path for rich content, and a nonce-based strict CSP rolled out in report-only mode first. For auth we moved tokens out of localStorage to a BFF with httpOnly session cookies. On supply chain we added Renovate with grouped updates, Socket scanning, and a policy requiring justification for new runtime dependencies. We tracked CSP violations and dependency vulnerability age as metrics in our monthly security review."
