Build a `TrafficLight` component that cycles **green → yellow → red → green…**

## Requirements

1. Timings come from a `config` prop. The default is green **3000 ms**, yellow **1000 ms**, red **4000 ms**, and each state names the `next` one:

   ```js
   const DEFAULT_CONFIG = {
     green: { duration: 3000, next: 'yellow' },
     yellow: { duration: 1000, next: 'red' },
     red: { duration: 4000, next: 'green' },
   };
   ```

   The component must work with any config of this shape (for example, a pedestrian light with only red and green).
2. It starts in green, or in the `initial` prop if one is given.
3. Render three vertical lamps. Only the active lamp is lit.
4. A **Pause / Resume** button stops and restarts the cycle. Moving content needs a way to pause it.
5. Accessibility: the light is a single image with an accessible name that reflects its state, for example `role="img"` with `aria-label="Traffic light: green"`. Don't use a live region that announces every change.
6. No leaked timers when the component unmounts or the config changes.

## Follow-up

- `setInterval` or chained `setTimeout`? Why?
- On resume, should the current light restart its full duration or continue with the time left? Implement the second.
- How would you model this as an explicit state machine?
