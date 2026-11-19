## Model it as a state machine

A traffic light *is* a finite state machine: a current state plus transitions. The config makes that explicit:

```js
{ green: { duration: 3000, next: 'yellow' }, yellow: { … }, red: { … } }
```

- The component holds only `light` (the current state) and `paused`.
- No hard-coded colour logic: a pedestrian light (`stop`/`walk`) or a four-phase European light (red → red+amber → green → amber) is just a different config.
- Lamps render in physical order (red, yellow, green) regardless of the config's key order, and custom states are appended.

## Timer: chained `setTimeout` in an effect

```js
useEffect(() => {
  if (paused) return;
  const id = setTimeout(() => setLight(config[light].next), delay);
  return () => clearTimeout(id);
}, [light, paused, config]);
```

- **One timeout per state.** Every transition changes `light`, which re-runs the effect and schedules the next timeout. `setInterval` doesn't fit, because each state has a different duration.
- **Cleanup** clears the pending timeout on unmount, on pause and when `config` changes. No leaks, and it's safe under Strict Mode's double-invoked effects.
- **No stale closures.** The effect reads `light` and `config` from the render it belongs to, and both are dependencies.
- If the parent passes a new `config` object on every render, the effect restarts constantly. Document that callers should memoise or hoist the config, or compare it by value.

## Pause and resume with remaining time

Restarting the full duration on resume is simple but wrong for long states. We record when the current timeout started (`timer` ref). The **Pause click handler** stores the time left in `remaining`, and the next effect run (on resume) uses it instead of the full duration, then clears it.

Doing this in the event handler rather than in effect cleanup matters. Cleanup also runs on normal transitions and unmounts, so computing "remaining" there would carry a near-zero leftover into the next light and skip it.

Refs, not state, hold the timing bookkeeping, because changing it should never cause a render.

## Accessibility

- The light is **one image**: `role="img"` with `aria-label="Traffic light: green"`, and the lamps are presentational children. Three separate lamps with their own names would be noise.
- It's **not** a live region. Announcing a state change every 1–4 seconds would make the page unusable with a screen reader. Users can query the image when they want to.
- **Pause control:** content that changes automatically for more than 5 seconds needs a way to pause it (WCAG 2.2.2). The button's label names its action.
- Colour isn't the only cue: lamp *position* (top, middle, bottom) carries meaning too, as on real lights, and the accessible name spells it out.
- Glow transitions respect `prefers-reduced-motion`.

## Edge cases

- `initial` isn't in the config: validate it and fall back to the first key.
- A duration of 0 or less: guard against it, or a misconfiguration could create a tight render loop.
- Background tabs throttle timers to at least 1 s. For a real signal controller, timing would come from the server or the hardware. Here, the drift is fine.

## Productionizing

- Extract a `useCycle(config, { initial, paused })` hook that returns the current state. The UI becomes a pure function of state.
- For complex machines (guards, parallel states, events like "emergency vehicle"), use a reducer of `(state, event) → state`, or XState, which also visualises the machine.
- Testing: inject a fast config and use short real waits, as the tests do. With fake timers you'd advance time precisely, but the config prop alone keeps tests fast.

## Follow-ups

- **Synchronised intersection:** two lights driven by one machine whose states are pairs (`NS_GREEN/EW_RED`), so they can never both be green. Model the safety invariant in the state space rather than checking it at runtime.
