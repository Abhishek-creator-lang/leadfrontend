Design the **home feed of Pinterest**: an endless, responsive **masonry grid** of "pins" (an image with an optional
title, author and a save button). Pins have different heights, so columns are filled unevenly, like bricks.

The interviewer asks you to cover:

- How the masonry layout is computed and kept stable as more pins load and the window resizes.
- Infinite scroll through thousands of pins without the page slowing down.
- Image loading strategy (pins are 90% of the page bytes).
- Opening a pin into a close-up view and coming back to the same scroll position.
- Saving a pin to a board.

Assume desktop and mobile web, and that a recommendation API already returns pins.
