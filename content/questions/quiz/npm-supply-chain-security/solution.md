## TL;DR

A typical front-end app pulls in **hundreds to thousands of transitive packages**, and any one of them can run code on developer machines and CI (via install scripts) and ship code to every user (via the bundle). The main threats are **compromised maintainer accounts, malicious new versions, typosquats, dependency confusion and abandoned packages**. The defences: **lockfiles and `npm ci`, a cooldown before adopting new versions, restricting install scripts, provenance and audit checks, fewer dependencies, and least-privilege CI tokens**.

## Real incidents to anchor the discussion

- **event-stream (2018)**: a new "maintainer" added a dependency that targeted a specific Bitcoin wallet app.
- **ua-parser-js, coa, rc (2021)**: hijacked accounts published versions that installed cryptominers and password stealers via install scripts.
- **colors / faker (2022)**: the maintainer deliberately sabotaged his own packages. Not every threat is an outsider.
- **2025 npm worm campaigns**: phished maintainer credentials led to malicious releases of widely used packages, and some payloads stole tokens from CI and published further compromised versions. The ecosystem response included npm tightening token and 2FA requirements.

## Defences, by layer

**Installing**
- Commit the **lockfile** and use **`npm ci`** (or `pnpm install --frozen-lockfile`) in CI, so you build exactly what was reviewed.
- **Delay new versions** (a cooldown of a few days) through Renovate or Dependabot settings or package-manager options. Most malicious releases are detected and pulled within hours.
- **Restrict lifecycle scripts**: `npm ci --ignore-scripts` where possible. pnpm (v10+) doesn't run dependency install scripts unless they're allow-listed.
- Use a **private registry or proxy** with scoped packages (`@company/*`) to prevent **dependency confusion**, where a public package shadows your internal name.

**Choosing**
- Every new dependency gets a review: maintenance, maintainers, download trend, transitive size and install scripts. Prefer the platform (`fetch`, `Intl`, `structuredClone`) over micro-packages.
- Check **provenance**: npm can show that a package was built from a specific repo and commit via a CI workflow (Sigstore-based attestations). `npm audit signatures` verifies registry signatures and attestations.

**Monitoring**
- `npm audit`, GitHub Dependabot alerts, Socket or Snyk-style scanners that look for *behaviour* (new network or filesystem access, obfuscated code) rather than only known CVEs.
- Generate an **SBOM** for releases so you can answer "are we affected?" within minutes.
- Fix triage: many `npm audit` findings are dev-only or unreachable. Prioritise by exploitability, not count.

**Limiting blast radius**
- CI tokens with minimal scope, short-lived OIDC credentials instead of long-lived secrets, and no publish tokens on PR builds from forks.
- 2FA (preferably phishing-resistant) for anyone who publishes packages, and trusted publishing from CI.
- At runtime: CSP `connect-src` limits where a malicious bundled package can send data.

```js
// renovate.json (excerpt)
{
  "minimumReleaseAge": "3 days",
  "packageRules": [{ "matchUpdateTypes": ["major"], "dependencyDashboardApproval": true }]
}
```

## Pitfalls

- `npm install` in CI, which can silently update within semver ranges.
- Auto-merging every Dependabot PR immediately, which makes you the first victim of a malicious release.
- Treating `npm audit` = 0 as "secure". It only knows about *reported* vulnerabilities.
- Ignoring dev dependencies. They run on the machines with the most secrets.

## In an interview, mention…

- The two attack surfaces: install time (dev and CI machines) and runtime (user browsers).
- Lockfiles + `npm ci`, release-age cooldowns, script restrictions, provenance.
- A named incident and how your process would have caught or contained it.
- Ownership: a dependency policy, not heroics.
