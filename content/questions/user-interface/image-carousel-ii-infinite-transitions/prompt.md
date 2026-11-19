This builds on *Image Carousel*. The starter already has a working carousel that **snaps** between images. Make it **slide**.

## Requirements

1. Clicking **Next** slides the strip of images to the left; **Previous** slides it to the right (about 400 ms, eased).
2. The loop is **seamless in both directions**. Going Next from the last image slides forward into the first image; it must *not* rewind backwards through every image. Same for Previous on the first image.
3. Clicking a **dot** slides directly to that image.
4. Rapid clicking must never leave the carousel stuck between slides, on a blank area, or out of sync with the dots.
5. Users who set `prefers-reduced-motion: reduce` get the snapping behaviour with no animation.
6. Keep the accessibility from part I: carousel/slide role descriptions, the `"N of M"` slide label, named buttons, `aria-current` on the active dot, and <kbd>←</kbd>/<kbd>→</kbd> keys. Slides that are off-screen must not be read by screen readers or reachable with <kbd>Tab</kbd>.

## Hints

- Animate `transform: translateX(...)` on a track that contains *all* slides, rather than swapping a single `<img>`.
- One common trick for an infinite loop: put a copy of the last slide before the first and a copy of the first after the last.

## Follow-up

- Add autoplay that pauses on hover and focus and has a visible pause button.
- Support swiping on touch devices, with the slide following the finger.
- How would you do this with the Web Animations API or CSS scroll snap instead?
