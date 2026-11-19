## TL;DR

In React, **data flows down the tree through props**, and **changes flow up through callbacks** that the owner of the state provides. A child can't modify its parent's data directly. It asks the owner to change it, the owner updates its state, and React re-renders downward with the new props. Benefits: **one owner per piece of state**, **predictable and traceable updates**, easier debugging and testing, and a natural fit for React's "UI = f(state)" rendering. The trade-off is some extra wiring (lifting state, passing callbacks) compared with two-way binding.

## What it looks like

```jsx
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(20); // single owner

  return (
    <>
      <TemperatureInput
        label="Celsius"
        value={celsius}
        onChange={setCelsius}
      />
      <TemperatureInput
        label="Fahrenheit"
        value={celsius * 9 / 5 + 32}
        onChange={f => setCelsius((f - 32) * 5 / 9)}
      />
    </>
  );
}

function TemperatureInput({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input
        type="number"
        value={Number(value.toFixed(2))}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  );
}
```

Both inputs display data derived from **one source of truth**. Neither input owns temperature state. They report user intent upward, and the parent decides.

## Benefits

- **Single source of truth.** No two copies of the same data drifting apart.
- **Traceability.** To find why something changed, look at who owns the state and which callbacks call its setter. There's no hidden reverse binding.
- **Predictable rendering.** Given the same props and state, a component renders the same thing, which makes debugging, testing and SSR straightforward.
- **Performance reasoning.** Updates start at the owner and propagate down, so you know which subtree can be affected. Memoization and the Compiler rely on this.
- **Reusability.** Controlled, prop-driven components can be used in many contexts.

## Compared with two-way binding

Frameworks like AngularJS (`ng-model`) or Vue's `v-model` sync a value both ways automatically. That's convenient, but with many bindings changes can cascade unpredictably. Modern Vue and Angular still keep one-way flow underneath (`v-model` is sugar for a prop plus an event). React makes the "event up" half explicit.

## Scaling it

- **Lift state up** to the closest common ancestor when siblings share data.
- **Composition** (passing elements as `children`) avoids drilling through intermediate layers.
- **Context** broadcasts values down a subtree. The flow is still one-way: consumers change it via functions provided in the context.
- **Stores** (Redux, Zustand) are the same principle at app scale: actions up, state down.

## Pitfalls

- **Prop drilling** through many layers is noisy. Use composition or context.
- **Duplicating props into state** creates a second source of truth that drifts.
- **Mutating props** violates the model and causes bugs that are hard to see.

## In an interview, mention…

- Props down, events up, and each piece of state has exactly one owner.
- Predictability and debuggability as the main benefit, and the contrast with two-way binding.
- Lifting state, composition and context as scaling tools.
- How it underpins React's rendering and optimization model.
