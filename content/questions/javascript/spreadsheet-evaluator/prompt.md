Build the engine behind a spreadsheet grid. `createSheet()` returns a sheet where cells hold either plain values or formulas, and formulas update whenever the cells they depend on change.

```js
const sheet = createSheet();

sheet.set('A1', '10');
sheet.set('A2', '32');
sheet.set('A3', '=SUM(A1:A2) / 2');
sheet.get('A3'); // 21

sheet.set('A1', '50');
sheet.get('A3'); // 41  (recomputed)

sheet.set('B1', '=B2 + 1');
sheet.set('B2', '=B1 * 2');
sheet.get('B1'); // '#CYCLE!'

sheet.set('C1', '=A1 / (A2 - 32)');
sheet.get('C1'); // '#DIV/0!'
```

## API

| Method | Behaviour |
|---|---|
| `set(ref, raw)` | Stores the raw text for a cell. `ref` is a column of letters and a row number from 1, case-insensitive (`'a1'` is `'A1'`, `'AB12'` is valid). Invalid refs throw an `Error`. Setting `''` clears the cell. |
| `get(ref)` | Returns the cell's current value: a number, a string, `null` for an empty cell, or an error code string. |
| `getRaw(ref)` | Returns the raw text that was set (`''` for an empty cell). |

## Cell contents

- **Empty** (never set, or set to `''`): `get` returns `null`. Inside formulas, an empty cell counts as `0`.
- **Number:** raw text that isn't a formula and converts to a finite number (`'42'`, `'-3.5'`, `' 7 '`) has that numeric value.
- **Text:** any other non-formula raw text is a string value (`'hello'`).
- **Formula:** raw text starting with `=`.

## Formula language

- Number literals (`3`, `2.5`), cell references (`A1`, case-insensitive), parentheses.
- Binary `+ - * /` with normal precedence and left associativity; unary minus (`-A1`, `--2`).
- Functions `SUM`, `MIN`, `MAX` (case-insensitive) taking one or more comma-separated arguments. An argument is an expression or a **range** `A1:B3` (a rectangle, written in any corner order). Ranges are only allowed as function arguments. Inside a range, empty and text cells are ignored. `SUM` of nothing is `0`; `MIN`/`MAX` of nothing is `0`.
- A formula that is just a reference (`=A1`) returns that cell's value, even if it's text.

## Errors

Errors are returned as strings and **propagate**: any formula that uses an error value evaluates to that same error (the first one encountered, left to right).

| Code | When |
|---|---|
| `#ERROR!` | The formula can't be parsed. |
| `#CYCLE!` | The cell is part of, or depends on, a circular reference. |
| `#DIV/0!` | Division by zero. |
| `#VALUE!` | Text used in arithmetic (including as a direct function argument). |
| `#NAME?` | Unknown function name. |

## Requirements

- Values are always up to date after any `set`, including changes that **create or break** cycles.
- Don't re-evaluate formulas whose inputs haven't changed: cache values and invalidate only the changed cell and its (transitive) dependents.
- Never use `eval` or `new Function`.

## Follow-up

- How would you compute the order in which to recompute cells eagerly, and how does that detect cycles?
- What changes if two users edit the same sheet at the same time?
- How would you render a 1,000,000-row sheet in the browser?
