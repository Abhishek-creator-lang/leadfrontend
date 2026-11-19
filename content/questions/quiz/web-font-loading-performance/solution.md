## TL;DR

Fonts are discovered late, because the browser only requests them once CSS is parsed **and** some text needs them. Meanwhile text is invisible (FOIT) or shown in a fallback that later swaps (FOUT, which can cause layout shift). The recipe: **self-host WOFF2, subset it, preload the one or two critical files, choose `font-display` deliberately, and tune the fallback's metrics** so the swap barely moves anything.

## The levers

**1. Ship fewer, smaller files**
- WOFF2 only. All current browsers support it.
- **Subset** to the scripts you actually serve (`unicode-range` lets the browser download a Cyrillic file only when Cyrillic text appears).
- A **variable font** can replace four or five static weights with one file, but check that it's actually smaller for the weights you use.
- Question whether you need a custom font for body text at all. A system-font stack costs nothing.

**2. Discover them early**
```html
<link rel="preload" href="/fonts/brand-var.woff2" as="font" type="font/woff2" crossorigin>
```
`crossorigin` is **required** even for same-origin fonts, because fonts are fetched in CORS mode. Without it the preload is wasted and the font downloads twice. Preload only the fonts used above the fold.

Self-hosting avoids an extra DNS, TCP and TLS connection to a third-party font host. Browsers partition the HTTP cache per site, so the old argument that a shared CDN font is "probably already cached" no longer holds.

**3. Choose the swap behaviour**

| `font-display` | Behaviour | Use when |
|---|---|---|
| `block` | Invisible text up to ~3 s | Icon fonts (better: use SVG icons) |
| `swap` | Fallback immediately, swap whenever the font arrives | Brand-critical headings |
| `fallback` | ~100 ms block, ~3 s swap window, then keep the fallback | A balanced default |
| `optional` | ~100 ms block, then the browser may keep the fallback for this page load | Body text where stability matters most, with no late swap and no CLS |

**4. Make the fallback look like the real font**
```css
@font-face {
  font-family: "Brand";
  src: url(/fonts/brand-var.woff2) format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: "Brand Fallback";
  src: local("Arial");
  size-adjust: 105%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: "Brand", "Brand Fallback", system-ui, sans-serif; }
```
Tools and frameworks can compute these overrides automatically (for example Next.js's font module or the Fontaine and Capsize libraries). With matched metrics, `swap` causes almost no CLS. Support caveat: `size-adjust` works in all major engines, but Safari has not supported the `ascent-override` family of descriptors, so expect slightly larger shifts there.

## Pitfalls

- Preloading every weight and style. Preloads compete with the LCP image.
- Missing `crossorigin` on the font preload.
- Using `@import` of a third-party font CSS file inside your CSS. That's a chain of three serial requests before the font even starts.
- Text-as-LCP pages that block on fonts. `font-display: block` can push LCP out by seconds on slow networks.
- Faux bold or italic when a weight isn't loaded. Declare the weight range correctly in `@font-face`.

## In an interview, mention…

- Why fonts are late-discovered, and preload with `crossorigin` as the fix.
- The trade-off between `swap` (fast text, possible shift) and `optional` (stable, may never show the brand font on first view).
- Metric overrides (`size-adjust`, `ascent-override`) as the modern CLS fix.
- Cache partitioning making self-hosting the default choice.
