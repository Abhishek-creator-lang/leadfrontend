---
title: Component patterns
description: Compound components, render props, headless components, higher-order components, and custom hooks, covering when each fits, how to build them, and the trade-offs interviewers ask about.
source: original
---
Pattern questions show up in two ways: directly ("What's a compound component?") and indirectly ("Design a reusable `Select` for our design system"). Either way, interviewers want to see that you can choose the right abstraction for the reuse you need and explain the trade-offs. This chapter covers the five patterns you'll be asked about most.

## Overview

| Pattern | Shares | Best for | Main drawback |
| --- | --- | --- | --- |
| Custom hooks | Stateful logic | Reusing behavior across different UIs | Doesn't share markup |
| Compound components | Implicit state across related parts | Flexible composite widgets (Tabs, Select, Accordion) | More API surface; harder to enforce structure |
| Render props | Logic with caller-controlled rendering | Customizing rendering of specific parts | Nesting and verbosity |
| Headless components | Behavior plus a11y, no styles | Design systems, multi-brand UIs | Consumers must style everything |
| Higher-order components | Cross-cutting concerns by wrapping | Legacy code, some library integrations | Wrapper hell, prop collisions, typing pain |

In modern React, **custom hooks and composition** cover most needs. HOCs and render props survive mostly in specific niches.

## Custom hooks

Extract logic, return a small, stable API:

```tsx
function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((o) => !o), []);
  return { open, onOpen, onClose, onToggle };
}
```

**Guidelines**
- Name them `useX`, and keep a single responsibility.
- Return objects for many values (named and extensible), or tuples for two (`[value, setValue]`).
- Accept options objects so you can add parameters later without breaking callers.
- Don't wrap one `useState` in a hook just to rename it.

## Compound components

A parent holds shared state and exposes it to sub-components through context. Consumers compose the parts freely:

```tsx
type TabsCtx = { active: string; setActive: (id: string) => void; baseId: string };
const TabsContext = createContext<TabsCtx | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
}

function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  const baseId = useId();
  const value = useMemo(() => ({ active, setActive, baseId }), [active, baseId]);
  return <TabsContext value={value}>{children}</TabsContext>; // React 19 syntax; use .Provider on 18
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const { active, setActive, baseId } = useTabs();
  const selected = active === value;
  return (
    <button
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  const { active, baseId } = useTabs();
  if (active !== value) return null;
  return (
    <div role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`}>
      {children}
    </div>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

Usage:

```tsx
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="billing">Billing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel value="billing"><Billing /></Tabs.Panel>
</Tabs>
```

**Interview talking points**
- Context instead of `React.Children.map` + `cloneElement`, so parts can be nested or wrapped freely.
- A guard hook that throws a helpful error when parts are used outside the parent.
- Supporting controlled mode (`value` + `onValueChange`) alongside `defaultValue`.
- Keyboard support (arrow keys move between tabs, roving `tabIndex`) is required for the tabs ARIA pattern. Mention it even if you don't finish it.

## Render props

The component owns the behavior and calls a function to render:

```tsx
function Combobox<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T, state: { highlighted: boolean; selected: boolean }) => React.ReactNode;
}) {
  // ...behavior...
}
```

The `children`-as-function variant (`<Mouse>{({x, y}) => ...}</Mouse>`) was popular before hooks. Today, render props are mostly used as **slots for customizing part of a component** (e.g. `renderItem`, `renderEmpty`) rather than for sharing logic, which hooks do better.

## Headless components and hooks

Headless libraries provide behavior, state, keyboard interaction, and ARIA, and leave all markup and styles to you. Examples: Radix Primitives, React Aria (Adobe), Headless UI, Ark UI, Downshift, TanStack Table.

```tsx
// Hook-style headless (prop getters)
function useToggle({ defaultOn = false } = {}) {
  const [on, setOn] = useState(defaultOn);
  const getButtonProps = (props: React.ButtonHTMLAttributes<HTMLButtonElement> = {}) => ({
    ...props,
    'aria-pressed': on,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e);
      if (!e.defaultPrevented) setOn((o) => !o);
    },
  });
  return { on, getButtonProps };
}
```

**Prop getters** merge consumer props with internal handlers so consumers can extend behavior without breaking it. Calling the consumer's handler first and respecting `defaultPrevented` gives them an escape hatch.

**Why design systems choose headless:** accessibility and interaction logic are the hardest parts to get right and the same across brands, while styling varies. A headless core plus a thin styled layer lets several products share behavior.

### The `asChild` / slot pattern

Radix-style `asChild` lets a component apply its behavior to the consumer's element:

```tsx
<Dialog.Trigger asChild>
  <MyButton variant="primary">Open</MyButton>
</Dialog.Trigger>
```

This avoids nested interactive elements (`<button><a>`) and keeps the consumer's semantics.

## Higher-order components

```tsx
function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback: React.ReactNode) {
  function Wrapped(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }
  Wrapped.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;
  return Wrapped;
}
```

**Problems:** prop name collisions, hidden props ("where does `user` come from?"), deep wrapper trees in DevTools, and awkward ref forwarding (easier in React 19 since `ref` is a regular prop). **Still reasonable for:** wrapping with boundaries or providers, integrating with libraries that expect components, and route-level guards in some routers.

## Other patterns worth knowing

| Pattern | One-liner |
| --- | --- |
| Controlled vs uncontrolled | `value`/`onChange` vs `defaultValue`; support both with a `useControllableState` hook |
| State reducer | Let consumers override internal state transitions (`stateReducer` prop) |
| Polymorphic `as` prop | `<Text as="label">`; type carefully with generics |
| Provider pattern | Inject dependencies (theme, i18n, services) via context |
| Container/presentational | Data logic vs pure view; today usually hook plus component |
| Slots via props | `<Card header={...} footer={...}>` for named regions |

### `useControllableState` sketch

```tsx
function useControllableState<T>({
  value, defaultValue, onChange,
}: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const setValue = useCallback((next: T) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }, [isControlled, onChange]);
  return [current, setValue] as const;
}
```

## Choosing a pattern

- Reusing **logic** only → custom hook.
- Reusing **behavior plus a11y** with varied styling → headless (hook or primitives).
- A widget with **multiple coordinated parts** → compound components.
- Letting callers customize **one region** → render prop or slot prop.
- **Wrapping** with a cross-cutting concern → a wrapper component (rarely an HOC).

## Lead-level perspective

For a design system, the decision is strategic: **build headless primitives in-house, adopt one (Radix, React Aria), or buy a styled library**. Weigh accessibility maturity, customization needs, bundle cost, upgrade risk, and team capacity. A common answer: "Adopt a proven headless library for complex widgets (combobox, dialog, menu), wrap it in our own API so we can swap it later, and own styling with design tokens."
