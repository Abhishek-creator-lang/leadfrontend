Build an `ImageCarousel` component that shows **one image at a time** from a list of images.

The starter file has the image data and a static layout that always shows the first image. Make it work.

## Requirements

1. The first image is shown initially. Only the current image is rendered as an `<img>`, with its `alt` text.
2. A **Previous** and a **Next** button move between images. Navigation **wraps around**: Next on the last image shows the first, Previous on the first shows the last.
3. A row of **dot buttons**, one per image, jumps straight to that image. The dot for the current image is marked with `aria-current="true"`.
4. Accessibility, following the WAI-ARIA Carousel pattern:
   - The carousel is a `<section>` with `aria-roledescription="carousel"` and an `aria-label`.
   - The slide is a `role="group"` with `aria-roledescription="slide"` and a label like `"2 of 5"`.
   - Icon-only buttons have accessible names: `"Previous image"`, `"Next image"` and `"Show image N"` for the dots.
   - Screen-reader users hear the new slide when they navigate (`aria-live="polite"` on the slide container).
5. Keyboard: when focus is inside the carousel, <kbd>←</kbd> / <kbd>→</kbd> go to the previous / next image.
6. The image area keeps a fixed aspect ratio so the controls don't jump while images load.

## Follow-up

- Add autoplay. What does the APG say about pausing it (hover, focus, an explicit pause button)?
- Animate the transition between slides (see *Image Carousel II*).
- How would you avoid a blank flash when moving to an image that hasn't loaded yet?
