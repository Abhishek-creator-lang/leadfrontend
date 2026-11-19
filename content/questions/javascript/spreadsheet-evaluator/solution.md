## Architecture

A spreadsheet engine is three small systems glued together. Separating them is the main thing an interviewer looks for:

```text
set(ref, raw) ──► parse ──► AST + dependency set ──► dependency graph
                                                       │
get(ref) ──► cache hit? ──► evaluate AST (recursively get referenced cells)
                 ▲                                     │
                 └──────── invalidate dependents ◄─────┘ on every set
```

1. **Parser:** formula text to an AST.
2. **Dependency graph:** who reads whom, so a change knows what to invalidate.
3. **Evaluator with a cache:** computes values lazily, detects cycles, propagates errors.

## 1. Parsing

A tokenizer produces numbers, references (`/^[A-Z]+[1-9]\d*$/`), names (functions) and single-character operators. A recursive-descent parser encodes precedence in its call structure:

```text
expression := term (('+' | '-') term)*
term       := factor (('*' | '/') factor)*
factor     := '-' factor | number | ref | '(' expression ')' | NAME '(' argument (',' argument)* ')'
argument   := ref ':' ref | expression
```

Because `term` is parsed inside `expression`, `*` binds tighter than `+`, and the `while` loops produce left-associative trees (`10 - 4 - 3` is `(10 - 4) - 3`). Ranges are expanded to a list of refs at parse time, and only accepted in `argument`, so `=A1:A2` is a parse error.

A parse failure doesn't throw out of `set`; the cell is stored as invalid and evaluates to `#ERROR!`, which is what users expect from a spreadsheet.

## 2. The dependency graph

When a formula is parsed, walk the AST to collect every referenced cell (`deps`). Maintain the **reverse** map, `dependents: ref -> Set<ref>`: "these cells read me".

On `set`:
1. Remove the cell from the `dependents` sets of its **old** deps. Forgetting this makes cells keep recomputing because of references they no longer have.
2. Store the new contents and register its new deps.
3. **Invalidate**: delete the cached value of the cell and, via `dependents`, of everything that transitively depends on it. A `seen` set stops this walk from looping forever when there's a cycle.

Dependencies on cells that don't exist yet are fine: `B1 = A1 * 3` registers B1 as a dependent of A1 before A1 is set, so setting A1 later invalidates B1.

## 3. Lazy evaluation, caching and cycles

`evaluate(ref, visiting)`:

- Literal cells return their value; empty cells return `null`.
- A cached value is returned immediately.
- If `ref` is in `visiting` (the set of cells on the **current evaluation path**), we've come back to a cell that's still being computed: a cycle. Return `#CYCLE!`.
- Otherwise add `ref` to `visiting`, evaluate the AST with a lookup that recursively calls `evaluate`, remove it, cache and return.

Every cell that reaches the cycle receives `#CYCLE!` through normal error propagation, which covers both "is in a cycle" and "depends on a cycle". Breaking the cycle with a `set` invalidates all of them, and they recompute correctly.

This is a depth-first search with "in progress" marking, the same idea as cycle detection in topological sort (white/grey/black colouring): a back edge to a grey node is a cycle.

### Errors as values

Errors are represented internally as `SheetError` objects, not thrown exceptions. Each operator checks its operands and returns the first error it finds, so `=A1 * 2` where `A1` is `#DIV/0!` is `#DIV/0!`. Using objects instead of strings means a text cell that happens to contain `"#VALUE!"` isn't mistaken for an error; `get` converts to the code string at the boundary.

## Complexity

- `set`: O(size of formula) to parse, plus O(affected cells) to invalidate.
- `get`: O(size of the dependency subgraph that isn't cached). With a warm cache, O(1).
- Memory: O(cells + edges).

Lazy evaluation means a change to `A1` costs nothing until someone reads an affected cell. An eager engine instead recomputes affected cells in **topological order** right away (Kahn's algorithm over the affected subgraph; any cells left with unresolved in-degree are exactly the cycle). Eager evaluation is what you want when the UI shows all visible cells anyway and you want to notify subscribers once per change.

## Edge cases

- Self-reference (`A1 = A1 + 1`).
- Long chains: deep recursion could overflow the stack with thousands of chained cells; production engines evaluate iteratively in topological order.
- Ranges in reverse order (`B2:A1`) are normalised.
- Clearing a cell (`''`) removes it, so dependents see `0`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Recomputing everything on each `set` | O(all cells) per keystroke |
| Not removing old dependency edges | Stale recomputation, memory growth |
| A global "visited" set instead of the current path | Diamond dependencies (`C = A + B`, both reading `X`) falsely reported as cycles |
| Throwing on parse errors | One bad formula breaks `set` for the whole sheet |
| Invalidation without a `seen` set | Infinite loop when a cycle exists |
| Using `eval` on the formula | Arbitrary code execution from cell contents |

## Real-world connection

- **Excel, Google Sheets** keep a dependency graph and recalculate the "dirty" cells in topological order; Excel calls this the calculation chain. Volatile functions like `NOW()` are always dirty.
- **Reactive UI libraries** solve the same problem: MobX computed values, Vue's `computed`, signals (see *Signals*) and Jotai derived atoms are dependency graphs with cached derived values and invalidation.
- **Build tools** (Make, Bazel, Turborepo, webpack's module graph) invalidate dependents when a file changes and detect circular dependencies the same way.

## Follow-ups

- **Rendering a huge grid:** virtualise rows and columns, only evaluate visible cells (lazy evaluation pays off), and run recalculation in a Web Worker so typing stays responsive.
- **Collaboration:** sync raw cell inputs with OT/CRDTs (the graph is derived state, recomputed on each client), and resolve conflicting edits per cell (last writer wins is common).
- **Copy/paste of formulas:** relative vs absolute references (`$A$1`) require rewriting refs when formulas move.
- **Subscriptions:** emit change events for cells whose value actually changed after a `set`.
