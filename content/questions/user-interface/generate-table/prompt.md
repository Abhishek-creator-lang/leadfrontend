Build a form that generates a table of consecutive numbers.

## Requirements

1. Inputs: **Rows** and **Columns** (whole numbers from 1 to 20) and a **Fill order** select. Clicking **Generate** (or pressing <kbd>Enter</kbd>) renders the table. The table updates only on submit, not while typing.
2. The table contains the numbers `1 … rows × columns`, placed according to the fill order:

   | Fill order | 2 × 3 result |
   |---|---|
   | Row by row | `1 2 3` / `4 5 6` |
   | Column by column | `1 3 5` / `2 4 6` |
   | Snake (columns) | `1 4 5` / `2 3 6`: down the first column, up the second, down the third… |

3. Out-of-range or non-numeric input shows an error (`aria-invalid` + linked message) and keeps the previous table.
4. The table has a `<caption>` describing it ("2 × 3 table, snake order"), so screen-reader users know what they're in.

## Follow-up

- Compute each cell's value with a formula instead of filling a 2D array. Which is clearer?
- 20 × 20 is fine. What changes at 1,000 × 1,000?
- Controlled inputs or `FormData` on submit? Which fits better here?
