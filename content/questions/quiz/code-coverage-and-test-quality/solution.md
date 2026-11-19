## TL;DR

**Code coverage** measures **which parts of the code ran** during tests: lines/statements, branches, functions. It's great at revealing **what is *not* tested** (a 0% file, an untaken `else`), but it **doesn't prove tests are good**: code can be executed without any meaningful assertion. Use coverage as a **map for finding gaps** and a **guard against regressions on critical modules**, not as a vanity number. **Mutation testing** is a better measure of whether tests actually catch bugs.

## The metrics

| Metric | Counts | Example gap it finds |
|---|---|---|
| Statement / line | Executed statements | Error-handling block never run |
| Branch | Each side of `if`, `?:`, `&&`, `??`, `switch` cases | `discount ?? 0` never exercised with `undefined` |
| Function | Functions called at least once | Unused export, untested helper |

Branch coverage is the most informative; 100% line coverage can still miss half the branches.

```js
function shippingCost(order) {
  if (order.total > 100 || order.isMember) return 0;
  return 7.99;
}
// One test with total=150 covers every line,
// but never checks isMember=true with a small total, or the paid case.
```

## Generating it

```bash
npx vitest run --coverage            # V8 provider by default, or Istanbul
npx jest --coverage
npx playwright test                  # E2E coverage is possible via V8 coverage APIs
```

Reports show per-file percentages and highlight uncovered lines in HTML. Thresholds can fail CI:

```js
// vitest.config.js
export default {
  test: {
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 80, branches: 75 },
      exclude: ['**/*.stories.*', '**/generated/**'],
    },
  },
};
```

**V8 vs Istanbul**: V8 uses the engine's built-in coverage (fast, no instrumentation); Istanbul instruments code (historically more precise for branches). Modern Vitest's V8 provider remaps results to be very close to Istanbul's accuracy.

## What coverage can't tell you

```js
test('calculates tax', () => {
  calculateTax(100, 'DE'); // 100% coverage, zero assertions
});
```

- Whether assertions check the right thing.
- Missing behaviour: code you *should* have written isn't in the report.
- Integration problems between well-covered units.
- Input-space coverage: one run through a regex or parser isn't exhaustive.

**Goodhart's law** applies: when coverage becomes a target, people write assertion-free tests and test trivial code to hit the number.

## Better signals of test quality

- **Mutation testing** (Stryker): it makes small changes to your code (flip `>` to `>=`, remove a call) and checks whether a test fails. Surviving mutants show weak tests. Run it on critical modules; it's slow on large codebases.
- **Escaped defects**: bugs found in production that tests should have caught. Each one should produce a regression test.
- **Diff coverage**: coverage of *changed lines* in a PR is more actionable than a global number.
- **Flake rate and run time**: tests nobody trusts or waits for get ignored.
- **Review**: do tests cover edge cases and failure paths?

## Practical policy for a team

- Track coverage trends; investigate drops rather than enforcing a high global number.
- Set higher thresholds for core business logic (pricing, auth, data transforms), lower for UI glue and generated code.
- Require tests for bug fixes and new logic via code review and diff coverage.
- Exclude generated code, type-only files and stories from reports so numbers mean something.

## In an interview, mention…

- Line vs branch vs function coverage and why branches matter.
- Coverage shows what's untested, not what's well tested.
- Mutation testing and diff coverage as stronger signals.
- How you'd use coverage pragmatically in CI without gaming it.
