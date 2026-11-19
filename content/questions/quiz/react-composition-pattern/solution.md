## TL;DR

Composition means **building complex UI by combining components and passing UI into other components**, via `children`, element-valued props ("slots"), and **compound components** that share implicit state, rather than **inheritance** or configuration-heavy components. React's docs have long recommended composition over inheritance. Composition **reduces prop drilling**, **avoids boolean-prop explosions**, keeps components **flexible and reusable**, and can **improve performance**, because elements passed in as props don't re-render when the wrapper's state changes.

## `children` and slots

```jsx
function Card({ header, footer, children }) {
  return (
    <section className="card">
      {header && <header>{header}</header>}
      <div className="card-body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </section>
  );
}

<Card
  header={<h2>Billing</h2>}
  footer={<Button onClick={save}>Save</Button>}
>
  <BillingForm />
</Card>
```

`Card` doesn't need to know about buttons, titles or forms. Contrast with `<Card title="Billing" showSaveButton saveLabel="Save" onSave={save} footerAlign="right" />`, where every new requirement adds props.

## Avoiding prop drilling

```jsx
// Instead of passing `user` through Layout → Sidebar → Avatar…
function App() {
  const user = useUser();
  return <Layout sidebar={<Sidebar avatar={<Avatar user={user} />} />} />;
}
```

Intermediate components render what they're given. Only the top level knows about `user`. This often removes the need for context.

## Compound components

```jsx
const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext value={{ value, setValue }}>{children}</TabsContext>;
}
function Tab({ value, children }) {
  const ctx = useContext(TabsContext);
  return (
    <button role="tab" aria-selected={ctx.value === value} onClick={() => ctx.setValue(value)}>
      {children}
    </button>
  );
}
function TabPanel({ value, children }) {
  const ctx = useContext(TabsContext);
  return ctx.value === value ? <div role="tabpanel">{children}</div> : null;
}

<Tabs defaultValue="a">
  <div role="tablist"><Tab value="a">Profile</Tab><Tab value="b">Security</Tab></div>
  <TabPanel value="a"><Profile /></TabPanel>
  <TabPanel value="b"><Security /></TabPanel>
</Tabs>
```

Consumers control markup, order and styling, and the parts coordinate through context. This is the model used by Radix, Reach and React Aria-style libraries. (A full implementation also needs ids, keyboard navigation and focus management.)

## Performance benefit

```jsx
function ScrollTracker({ children }) {
  const [y, setY] = useState(0);
  // ...updates y on scroll
  return <div data-y={y}>{children}</div>; // children elements were created by the parent, so they don't re-render
}
```

## Other forms

- **Render props** when the container must supply data to the slot.
- **Polymorphic / `asChild` components** that merge behaviour onto a caller-provided element.
- **Server/client composition:** a Client Component can receive Server Component output as `children`, which is the main way to nest server-rendered content inside interactive shells.

## Pitfalls

- Overusing `cloneElement` or `Children.map` to inject props. It's brittle with fragments and wrappers. Prefer context or explicit props.
- Compound components used outside their parent. Throw a helpful error from the context hook.
- Too many slots can be as confusing as too many props.

## In an interview, mention…

- `children`, slots and compound components, and composition over inheritance.
- How composition solves prop drilling and boolean-prop explosion.
- The re-render benefit of passing elements as props.
- The RSC composition rule: pass Server Components as `children` to Client Components.
