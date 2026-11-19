Build a `TransferList`: two side-by-side lists ("Available" and "Selected") where users move items between them. Think of picking which columns to show in a report.

The starter has the initial items and a static layout.

## Requirements

1. Each item in either list has a checkbox.
2. Four buttons sit between the lists:
   - **»** move *all* items to Selected, **›** move *checked* items to Selected,
   - **‹** move *checked* items to Available, **«** move *all* items to Available.
3. Each button is **disabled** when it would do nothing (e.g. no checked items on the left, or the right list is empty).
4. Moved items are appended to the end of the destination list, keep their relative order, and arrive **unchecked**.
5. Each list has a header checkbox that selects or clears all of its items. It is checked when all items in that list are checked, indeterminate when only some are, and disabled when the list is empty. The header shows "*checked*/*total* selected".
6. Each list shows "No items" when empty.
7. Accessibility: the buttons have descriptive accessible names (the arrow glyphs alone aren't enough), and each list is labelled by its title.

## Follow-up

- Add a search box above each list. What does "select all" mean while a filter is active?
- Support reordering within the Selected list.
- How would you make it a controlled component for use in a form?
