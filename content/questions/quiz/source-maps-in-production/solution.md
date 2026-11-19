## TL;DR

A source map is a JSON file that maps positions in generated code (minified, bundled, transpiled) back to the **original files, lines, columns and names**. The bundle points to it with a `//# sourceMappingURL=` comment or a `SourceMap` HTTP header. DevTools and error trackers use it to show readable stack traces. For production, the usual answer is: **generate full source maps, upload them to your error-monitoring tool, and don't serve them publicly** ("hidden" source maps). That gives you debuggable production errors without handing out your original source.

## What's inside

```json
{
  "version": 3,
  "file": "app.3f9a.js",
  "sources": ["src/cart/Checkout.tsx", "src/utils/money.ts"],
  "sourcesContent": ["export function Checkout() { … }", "…"],
  "names": ["Checkout", "formatPrice", "total"],
  "mappings": "AAAA,SAASA,QAAQ;AACjB,..."
}
```

- `mappings` is a compact, Base64-VLQ-encoded list of segments: generated column → source index, original line, original column, and name index.
- `sourcesContent` embeds the original code. Without it, tools need access to the files at the `sources` paths.
- The format was standardised by TC39 as **ECMA-426** in 2024, after years as an informal "revision 3" spec. Extensions such as `ignoreList` let DevTools hide framework and `node_modules` frames.

## Production options

| Option | How | Trade-off |
|---|---|---|
| Public source maps | `.map` served next to the bundle, with `sourceMappingURL` | Easiest debugging for anyone, including users and attackers |
| **Hidden** source maps | Generate maps, omit the comment (webpack `hidden-source-map`, Vite `build.sourcemap: 'hidden'`), upload to Sentry/Datadog/etc. and delete them from the deploy artifact | Readable traces in your tooling; nothing public. **Most common choice** |
| Private hosting | Serve `.map` only on VPN or with auth, and reference them by URL | DevTools debugging for employees too |
| No maps | — | Unreadable production stack traces; slower incident response |

Error trackers match uploaded maps by **release identifier** and file URL, so tag each build with a release (the git SHA) in both the upload step and the client SDK. Mismatched releases are the #1 reason stack traces stay minified.

## Security perspective

- Source maps **don't create vulnerabilities**. Minification isn't a security control, and anyone can read your JS bundle anyway.
- But they make reverse engineering much easier, and they can **leak things you didn't mean to ship**: comments, internal URLs, feature-flag names, unreleased feature code that is dead-code-eliminated from the bundle but still in `sourcesContent`, and occasionally secrets mistakenly committed to client code. There have been public incidents where companies' full front-end source, including unreleased features, was reconstructed from public maps.
- Real secrets should never be in client code in the first place. Maps just make that mistake more visible.

## Build-time considerations

- Maps make builds slower and artifacts larger. Use cheaper modes in development (`eval-source-map`-style) and full maps in production builds.
- Every transform step must preserve and chain maps (TypeScript → Babel → bundler → minifier). A step that drops them gives wrong lines.
- CSS maps exist too and help with preprocessors and CSS-in-JS.

## Pitfalls

- Shipping public maps by accident because the bundler default or a framework setting enabled them. Add a CI check that no `.map` files are in the deploy artifact (if that's your policy).
- Forgetting to upload maps for every build, including hotfix deploys.
- Stale maps cached at the CDN, mismatching new bundles. Hashed filenames prevent this.

## In an interview, mention…

- What a map contains (`mappings`, `sources`, `sourcesContent`, `names`) at a high level, and ECMA-426.
- Hidden maps + upload to error tracking + release tagging as the standard setup.
- The real risk is information disclosure, not a vulnerability, and secrets don't belong in the client.
