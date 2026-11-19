A survey collected the **birth years** of its respondents. Build a histogram that shows how many people were born in each period.

The starter contains the raw data (an array of years) and an empty chart area. No charting libraries: render the bars with plain elements and CSS.

## Requirements

1. Group the years into **buckets** and render one vertical bar per bucket. The bar height is proportional to the count, with the tallest bar filling the chart height.
2. A **Bucket size** `<select>` offers `1`, `5` and `10` years (default `10`). Buckets align to multiples of the size (`1980–1989`, `1985–1989`, `1987`).
3. Buckets between the earliest and latest year are shown **even when they're empty**, so gaps are visible.
4. Each bar shows its label under it and its count above it.
5. An **Add a birth year** form lets the user add a year. Accept whole numbers from 1900 to the current year. Otherwise show an error message (`Enter a year between 1900 and <current year>`) next to the field.
6. Accessibility:
   - Screen-reader users must get the same information as sighted users. Each bar must have a name such as `1980–1989: 6 people` (`1 person` for a count of one).
   - A **Show as table** toggle swaps the chart for an equivalent data table.
   - The form error is linked to its input.

## Notes

- In a real app the years would come from an API. Assume the array fits in memory (a few thousand entries).

## Follow-up

- How would you handle 10 million records?
- Add a tooltip on hover/focus with the exact range and percentage.
- Make the chart responsive and add a y-axis with "nice" tick values.
