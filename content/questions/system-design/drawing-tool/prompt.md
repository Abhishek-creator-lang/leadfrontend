Design the front end of a **collaborative design and drawing tool** like Figma or Canva.

Users work on an infinite canvas: they draw rectangles, ellipses, lines, freehand paths and text, place images,
group and layer objects, and move, resize and rotate them. Multiple people can edit the same file at once and see
each other's cursors and selections live.

The interviewer adds:

- Large files contain **50,000–200,000 objects** across many frames/pages.
- Panning and zooming must stay smooth (60 fps) even in large files.
- Up to ~20 editors and many more viewers on a file; viewers follow a presenter's viewport.
- Undo/redo, copy/paste between files, and export to PNG/SVG are required.

Focus on the rendering technology choice, the scene data model, hit testing and spatial indexing, interaction
handling, the multiplayer model, and performance.
