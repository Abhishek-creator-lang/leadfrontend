Build a dice roller for six-sided dice.

## Requirements

1. A **Number of dice** input (whole number from 1 to 12, default 3) and a **Roll** button. Submitting the form rolls.
2. Show each die as a face with the right **pip layout** (draw it with HTML and CSS, not the ⚀–⚅ characters or images).
3. Every value is uniformly random from 1 to 6.
4. Show the **total** below the dice ("Total: 14").
5. Invalid counts show an error (`aria-invalid` + linked message) and don't roll.
6. Accessibility:
   - each die is announced as "Die showing 4", and the pips themselves are hidden
   - after a roll, screen-reader users hear the result without moving focus, for example "Rolled 3 dice: 4, 6, 4. Total 14."
7. Before the first roll, show a hint ("Choose how many dice and press Roll").

## Follow-up

- `Math.floor(Math.random() * 6) + 1`: is it uniform? When would you use `crypto.getRandomValues`?
- Add a short "shake" animation without breaking `prefers-reduced-motion`.
- How do you test code that depends on randomness?
