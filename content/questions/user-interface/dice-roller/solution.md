## State design

- `rolls: { id, values } | null`: the last roll. `null` means "not rolled yet", which drives the hint.
- `error`: the validation message.
- The count input is uncontrolled and read with `FormData` on submit. Nothing needs to react to it while the user types.
- `total` and the announcement text are derived.

The roll `id` is part of each die's key, so every roll mounts fresh dice and the CSS "settle" animation replays even if the values happen to be identical.

## Randomness

```js
Math.floor(random() * 6) + 1
```

- `Math.random()` returns a value in `[0, 1)`, so `* 6` gives `[0, 6)`, `floor` gives 0–5, and `+ 1` gives 1–6, all equally likely. Common bugs are `Math.round(Math.random() * 6)`, which yields 0–6 with the end values half as likely, and `Math.ceil(...)`, which can return 0.
- `Math.random` isn't cryptographically secure. That's fine for a game UI. For anything with stakes (gambling, raffles, security), use `crypto.getRandomValues` with **rejection sampling** to avoid modulo bias: draw a byte, reject values ≥ 252 (the largest multiple of 6 below 256), then take `byte % 6 + 1`. For real money, roll on the server.
- `rollDice(count, random)` takes the random function as a parameter. Tests or replays can inject a seeded PRNG (mulberry32, for example), which makes the logic deterministic without mocking globals.

## Drawing pips with CSS Grid

Each die is a 3 × 3 grid with named areas:

```
a . c
e g f
d . b
```

Pips fill the areas in the order a, b, c, d, e, f, and odd faces move their last pip to the centre `g`. Faces 1–6 then all fall out of six `nth-child` rules plus one override, with no per-face markup. The component just renders `value` pips. The same CSS scales with the die size because the pips are placed with `place-self: center`.

## Accessibility

- Each die is `role="img"` with `aria-label="Die showing 4"`. The pips are presentational children. The dice sit in a labelled list, so the count is announced.
- A **visually hidden `role="status"`** announces "Rolled 3 dice: 4, 6, 4. Total 14." after each roll. It's always mounted, because live regions must exist before their content changes. The visible "Total" is `aria-hidden` to avoid a double read.
- Focus stays on the Roll button, so users can roll again with <kbd>Enter</kbd>.
- The animation is disabled under `prefers-reduced-motion`. Spinning content can trigger vestibular disorders.
- Validation errors are linked with `aria-describedby`.

## Edge cases

- Count validation rejects `0`, `13`, `2.5`, `""` and `abc`. Native `min`/`max` on `type="number"` is a hint only.
- Rolling the same values twice: the status text is identical, and some screen readers skip repeated live-region text. Include the roll number ("Roll 4: …") or clear and re-set the text if that matters.

## Extensions

- **Other dice (d4, d8, d20):** draw numbers rather than pips for sides > 6, and validate that each value is in `1..sides`.
- **Hold dice (Yahtzee):** each die becomes a toggle button with `aria-pressed`, and re-rolls only replace unheld values.
- **History:** keep the last N rolls in an array, and show a histogram to demonstrate uniformity.
