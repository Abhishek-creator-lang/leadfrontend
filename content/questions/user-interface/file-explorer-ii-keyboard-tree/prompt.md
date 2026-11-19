This builds on *File Explorer*. The starter already renders a sorted, collapsible folder tree with mouse support. Turn it into a proper **tree view** that keyboard and screen-reader users can drive the way they would in a desktop file manager, following the WAI-ARIA Tree View pattern.

## Requirements

1. **Roles.** The container has `role="tree"` and an accessible name. Every folder and file is a `role="treeitem"`; children of a folder are wrapped in `role="group"`. Folders expose `aria-expanded`.
2. **One tab stop.** Only one treeitem has `tabIndex={0}` at a time (roving tabindex); the rest have `-1`. Tabbing into the tree lands on the last focused item (initially the first item).
3. **Keyboard:**

   | Key | Behaviour |
   |---|---|
   | <kbd>↓</kbd> / <kbd>↑</kbd> | Next / previous *visible* item (no wrapping) |
   | <kbd>→</kbd> | Closed folder: open it. Open folder: move to its first child. File: nothing |
   | <kbd>←</kbd> | Open folder: close it. Otherwise: move to the parent folder |
   | <kbd>Home</kbd> / <kbd>End</kbd> | First / last visible item |
   | <kbd>Enter</kbd> | Folder: toggle. File: select it |
   | A letter | Move to the next visible item whose name starts with that letter (type-ahead) |

4. **Selection.** Clicking or pressing Enter on a file selects it (`aria-selected="true"`) and shows "Selected: *name*" below the tree.
5. If a mouse click collapses the folder that contains the focused item, the folder itself becomes the tab stop, so the tree is never left without one.

## Follow-up

- Multi-select with <kbd>Shift</kbd>+arrows and <kbd>Ctrl</kbd>+click (`aria-multiselectable`).
- <kbd>*</kbd> expands all siblings. How would you implement it?
- How do you combine this with virtualization, where most treeitems aren't in the DOM?
