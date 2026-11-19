## TL;DR

Use a **testing pyramid or trophy**: **static checks** (TypeScript, ESLint including the hooks rules) at the base, **unit tests** for pure logic and hooks, **component/integration tests** with **React Testing Library** (RTL) as the bulk, and a smaller set of **end-to-end tests** (Playwright or Cypress) for critical user journeys. Test **behaviour as a user perceives it**: query by role and label, interact with `user-event`, and assert on visible output. Avoid testing implementation details like state values or which hooks ran. Mock the network at the boundary with **MSW**.

## Layers

| Layer | Tools | What to test |
|---|---|---|
| Static | TypeScript, ESLint (`react-hooks`, `jsx-a11y`) | Types, hook rules, obvious a11y problems |
| Unit | Vitest or Jest | Reducers, utilities, formatters, custom hooks (`renderHook`) |
| Component / integration | RTL + `user-event` + MSW | Components wired together with real children and a mocked network |
| E2E | Playwright, Cypress | Login, checkout, critical flows in a real browser |
| Visual / a11y | Storybook + Chromatic, axe | Regressions in appearance, WCAG violations |

## A good component test

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './test/server';
import TodoApp from './TodoApp';

test('adds a todo and shows it in the list', async () => {
  server.use(
    http.post('/api/todos', async ({ request }) => {
      const { text } = await request.json();
      return HttpResponse.json({ id: '1', text }, { status: 201 });
    })
  );
  const user = userEvent.setup();
  render(<TodoApp />);

  await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Write tests');
  await user.click(screen.getByRole('button', { name: /add/i }));

  expect(await screen.findByRole('listitem')).toHaveTextContent('Write tests');
});
```

Why this is robust:

- **Role and label queries** mirror how assistive tech sees the page, so they double as a11y checks.
- **`user-event`** simulates realistic sequences (focus, keydown, input, click) rather than raw `fireEvent`.
- **`findBy*`** waits for async UI, so you don't need manual `act()` or sleeps.
- **MSW** mocks at the network layer, so the component's real data-fetching code runs.

## Testing hooks and logic

- Pure functions and reducers need plain unit tests, no rendering.
- Custom hooks: `renderHook(() => useCounter())` from RTL. Better still, test them through a small component that uses them.
- Context-dependent components: render with a `wrapper` providing real providers (router, query client, theme) via a custom `render` helper.

## Modern React specifics

- **Async rendering:** React 18+ and RTL wrap renders and events in `act` for you. Warnings about `act` usually mean an un-awaited update. Use `findBy`/`waitFor`.
- **Server Components:** async RSCs aren't well supported by unit renderers yet. Test their data logic separately and cover the rendered result with E2E or framework-level tests.
- **Suspense/`use`:** render inside a `<Suspense>` boundary in tests and await the resolved content.

## Pitfalls

- Snapshot tests of large trees: they're brittle, get rubber-stamped on update, and catch little.
- Asserting on internal state or calling component methods.
- Over-mocking child components, so the test no longer resembles reality.
- Flaky E2E caused by fixed waits. Use auto-waiting locators and test-specific data.
- Chasing 100% coverage instead of covering risky paths.

## In an interview, mention…

- The trophy/pyramid and where most value comes from (integration tests with RTL).
- User-centric queries, `user-event`, and MSW instead of mocking fetch.
- CI strategy: fast unit/integration on every PR, E2E on critical paths, visual and a11y checks.
- Testing challenges with RSC and async rendering, and how you'd handle them.
