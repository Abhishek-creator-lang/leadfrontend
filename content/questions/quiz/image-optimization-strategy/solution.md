## TL;DR

Images are usually the largest bytes on a page and often the LCP element. A good setup has five parts. **Modern formats** (AVIF, then WebP, with a JPEG/PNG fallback). **Responsive sizing** with `srcset`/`sizes` so phones don't download desktop pixels. **Correct loading priority** (eager and `fetchpriority="high"` for the hero, `loading="lazy"` below the fold). **Explicit dimensions** to prevent CLS. And an **image CDN or build pipeline** so none of this depends on each engineer remembering it.

## The building blocks

```html
<picture>
  <source type="image/avif"
          srcset="/p/42-400.avif 400w, /p/42-800.avif 800w, /p/42-1600.avif 1600w"
          sizes="(max-width: 700px) 100vw, 50vw">
  <source type="image/webp"
          srcset="/p/42-400.webp 400w, /p/42-800.webp 800w, /p/42-1600.webp 1600w"
          sizes="(max-width: 700px) 100vw, 50vw">
  <img src="/p/42-800.jpg" width="800" height="600"
       alt="Blue running shoe, side view"
       loading="lazy" decoding="async">
</picture>
```

- **Formats.** AVIF typically beats WebP, which beats JPEG, at the same visual quality. AVIF encoding is slower and very large AVIFs can decode slowly on low-end devices. All current major browsers support both formats. Keep SVG for icons and logos, and don't use PNG for photos.
- **`srcset` with `w` descriptors + `sizes`.** The browser picks a candidate using the layout width you declare in `sizes` and the device pixel ratio. A wrong `sizes` (for example the default `100vw` for a thumbnail) wastes bytes. Use `x` descriptors only for fixed-size images.
- **`<picture>` with `media`** is for **art direction** (a different crop on mobile), not just resolution switching.
- **Quality.** Perceptual quality ~60–75 is usually indistinguishable. Cap the DPR at 2x for most photos, because 3x screens rarely benefit visibly.

## Loading priority

| Image | Attributes |
|---|---|
| LCP hero | no `loading="lazy"`, `fetchpriority="high"`, ideally in the server HTML |
| Above the fold, not LCP | default (eager) |
| Below the fold | `loading="lazy"`, `decoding="async"` |
| Carousels' hidden slides | `loading="lazy"` or `fetchpriority="low"` |

Native lazy loading uses generous distance thresholds, so images usually arrive before the user scrolls to them. Always pair it with `width`/`height` or `aspect-ratio`.

## At scale: pipeline and governance

- **Image CDN** (self-hosted or a vendor) that resizes, transcodes and caches by URL parameters, and can negotiate format from the `Accept` header. Send `Vary: Accept` or use distinct URLs so caches don't serve AVIF to a client that can't decode it.
- A shared `<Image>` component that **requires** `alt`, width/height and `sizes`, and supports a `priority` prop for the hero.
- Long immutable caching with content-hashed URLs.
- CI checks: max byte budgets per template and lint rules against lazy-loading the hero. RUM tracking of LCP resource size.
- User-generated uploads: strip EXIF (privacy and bytes), normalise orientation, and generate the renditions asynchronously.

## Pitfalls

- CSS `background-image` for meaningful or LCP images. The preload scanner can't see it and there's no `alt`.
- Lazy-loading everything, including the hero.
- Forgetting `sizes`, so the browser assumes `100vw` and downloads the biggest candidate.
- Serving huge GIFs. Use `<video autoplay muted loop playsinline>` with MP4/WebM instead.
- Over-compressing product photography that the business depends on. Agree a quality bar with design.

## In an interview, mention…

- How the browser picks a `srcset` candidate (layout width × DPR), and art direction vs resolution switching.
- Priority: `fetchpriority`, lazy loading only below the fold, and the effect on LCP.
- CLS prevention with dimensions.
- Making it systemic: an image CDN, a shared component, budgets in CI.
