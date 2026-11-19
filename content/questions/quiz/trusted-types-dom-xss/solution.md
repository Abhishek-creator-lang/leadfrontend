## TL;DR

DOM XSS happens when a string reaches an **injection sink** such as `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `script.src` or `new Function`. **Trusted Types** let you enforce, through CSP (`require-trusted-types-for 'script'`), that these sinks **only accept typed objects** (`TrustedHTML`, `TrustedScript`, `TrustedScriptURL`) created by **named policies you control**. Any plain string assignment throws. That turns DOM XSS from "find every bug by review" into "**audit a handful of policies**". It's the technique Google credits for largely eliminating DOM XSS in apps that adopted it.

## How it works

```http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types app-sanitizer
```

```js
const sanitizer = trustedTypes.createPolicy('app-sanitizer', {
  createHTML: (input) => DOMPurify.sanitize(input),
  createScriptURL: (url) => {
    const u = new URL(url, location.origin);
    if (u.origin === location.origin || u.origin === 'https://cdn.example.com') return u.href;
    throw new TypeError('Untrusted script URL: ' + url);
  },
});

el.innerHTML = userBio;                          // throws TypeError under enforcement
el.innerHTML = sanitizer.createHTML(userBio);    // allowed
el.textContent = userBio;                        // fine: not an HTML sink
```

- `trusted-types <names>` restricts **which policy names** can be created, so a malicious script can't simply create its own permissive policy. Add `'none'` to forbid all policies, or `'allow-duplicates'` if a library recreates its policy.
- A **`default` policy** is called automatically for any plain string reaching a sink. It's a migration tool: log or sanitise there while you fix call sites, then remove it.
- DOMPurify supports returning `TrustedHTML` directly (`RETURN_TRUSTED_TYPE: true`).

## Rollout on an existing app

1. Ship **`Content-Security-Policy-Report-Only: require-trusted-types-for 'script'`** with a reporting endpoint. Violation reports name the sink and include a sample of the offending code.
2. Fix call sites: prefer **safe APIs** (`textContent`, `setAttribute` for non-URL attributes, DOM construction, framework templating) over policies. React's JSX doesn't hit sinks except via `dangerouslySetInnerHTML`.
3. Funnel the remaining legitimate HTML (CMS content, Markdown) through one or two reviewed policies.
4. Handle third-party libraries: many popular libraries are now Trusted Types-compatible. For others, a temporary default policy or a library-specific named policy is the bridge.
5. Enforce, keep the reporting, and add a lint rule or code-owner review for `createPolicy`.

## Browser support

Trusted Types have been in Chromium-based browsers since 2020. Other engines have been implementing them more recently, so check current support tables. Enforcement is still worth it with partial coverage: violations caught in Chromium (in CI, end-to-end tests and production reports) fix the bug for every browser. For non-supporting browsers, the small `trustedTypes` polyfill or a "tinyfill" (`if (!window.trustedTypes) window.trustedTypes = { createPolicy: (n, p) => p }`) keeps your code paths uniform.

## Pitfalls

- A policy that returns its input unchanged (`createHTML: s => s`) just relabels the bug. Policies must actually validate or sanitise.
- Too many policies scattered across the codebase defeat the "small audit surface" goal.
- Forgetting script-URL sinks (`script.src`, `importScripts`, `Worker` URLs), which need `TrustedScriptURL`.
- Treating Trusted Types as a replacement for CSP script controls. Use both: strict CSP blocks injected `<script>`, Trusted Types guards DOM sinks.

## In an interview, mention…

- Sources and sinks, and how type enforcement turns runtime bugs into thrown errors.
- Named policies, the `trusted-types` allow-list, the default policy as a migration aid.
- Report-only rollout and the library-compatibility work.
- Support status and why enforcing it in the browsers that have it still pays off.
