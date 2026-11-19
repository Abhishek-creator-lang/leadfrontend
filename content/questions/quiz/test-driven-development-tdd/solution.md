## TL;DR

**Test-driven development** is a workflow where you **write a failing test first**, then **write the minimum code to make it pass**, then **refactor** with the test as a safety net: **red → green → refactor**, in small increments. The tests are a by-product; the main benefits are **design feedback** (code ends up testable and decoupled), **clear scope** (you build only what a test demands), and **confidence to refactor**. It shines for logic with clear inputs and outputs and for bug fixes; it's harder for exploratory UI work.

## The cycle

1. **Red**: write a small test for the next bit of behaviour. Run it and watch it fail (proving it tests something).
2. **Green**: write the simplest code that passes. Hard-coding is allowed at this stage.
3. **Refactor**: remove duplication, improve names and structure, keeping all tests green.
4. Repeat with the next behaviour.

## Example: a slug function

```js
// 1. red
test('lowercases and joins words with hyphens', () => {
  expect(slugify('Hello World')).toBe('hello-world');
});
```

```js
// 2. green (minimum)
export const slugify = (s) => s.toLowerCase().replace(' ', '-');
```

```js
// next red: forces a more general solution
test('collapses repeated separators and trims', () => {
  expect(slugify('  Hello,   World!  ')).toBe('hello-world');
});
```

```js
// green again
export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
```

```js
// next red: an edge case discovered while thinking about inputs
test('strips accents', () => {
  expect(slugify('Crème Brûlée')).toBe('creme-brulee');
});
```

```js
// green + refactor
export function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // remove combining marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

Each new test drove a specific generalisation; nothing was built speculatively.

## Benefits

- **Design pressure**: writing the test first makes you think about the API from the caller's side. Hard-to-test code shows up immediately as hard-to-write tests.
- **Executable specification** and regression protection.
- **Small steps** reduce debugging time: when something breaks, it's in the last few lines.
- **Refactoring confidence**.
- **Bug fixes**: reproduce the bug as a failing test first, then fix it. The test prevents it from returning.

## Costs and criticisms

- Slower at the start; payoff comes over the codebase's lifetime.
- Tests coupled to implementation details make refactoring *harder*. TDD works best when tests target behaviour.
- Awkward for exploratory or highly visual UI work, spikes and prototypes, where requirements emerge by trying. A common approach is to spike, throw the spike away, then TDD the real implementation.
- Can drift into over-mocking ("London school") that tests interactions rather than outcomes.

## TDD in front-end work

- Works great for: reducers/state machines, utilities, form validation, data transformations, hooks with clear contracts, API client error handling.
- For components: write a Testing Library test describing what the user does and sees, then build the component until it passes.
- **Outside-in / ATDD/BDD** variant: start from a failing acceptance or E2E test for a user story, then TDD the units needed to satisfy it.

## In an interview, mention…

- Red-green-refactor and why seeing the test fail first matters.
- Design feedback as the real benefit, not only test coverage.
- Where you'd use it (logic, bug fixes) and where you'd adapt it (exploratory UI), showing pragmatism rather than dogma.
