Design the front end of a **collaborative spreadsheet** like Google Sheets.

Users open a workbook with one or more sheets, scroll through large grids, type values and formulas (`=SUM(A1:A100)`,
`=VLOOKUP(...)`), format cells, resize rows and columns, freeze panes, and see colleagues' selections and edits live.

The interviewer adds:

- Sheets can have up to **1 million rows × 100 columns**, though most real sheets have under 10,000 rows of data.
- A single edit can trigger recalculation of thousands of dependent formulas.
- Up to ~30 people may edit the same workbook concurrently.
- Copy/paste must interoperate with Excel and other spreadsheets.

Focus on grid rendering, the formula engine and dependency graph, where computation runs (client vs server), the
collaboration model, and performance. Assume you can define the backend APIs.
