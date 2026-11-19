These techniques are related to accessibility (a11y).

- `width: 0; height: 0`. Make the element not take up any space on the screen at all, resulting in not showing it.
- `position: absolute; left: -99999px`. Position it outside of the screen.
- `text-indent: -9999px`. This only works on text within the `block` elements. This is a widely used and famous trick, but it comes with [some downsides](https://zeldman.com/2012/03/01/replacing-the-9999px-hack-new-image-replacement/) like causing performance issues, so you might want to consider using `text-indent: 100%` instead.
- Meta tags. For example by using Schema.org, RDF, and JSON-LD.
- WAI-ARIA. A W3C technical specification that specifies how to increase the accessibility of web pages.

Even if WAI-ARIA is the ideal solution, I would go with the `absolute` positioning approach, as it has the least caveats, works for most elements and it's an easy technique.

- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- https://www.a11yproject.com/
- https://zeldman.com/2012/03/01/replacing-the-9999px-hack-new-image-replacement/
