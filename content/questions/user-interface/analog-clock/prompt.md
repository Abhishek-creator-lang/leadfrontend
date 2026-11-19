Build an analog clock showing the current local time.

## Requirements

1. Draw it with **SVG**: a face, 12 hour ticks (the 3, 6, 9 and 12 positions more prominent) and three hands: **hour**, **minute** and **second**.
2. The hands move continuously in the correct proportions:
   - the hour hand advances between hours (at 3:30 it's halfway between 3 and 4)
   - the minute hand advances with the seconds
   - the second hand ticks once per second.
3. Update every second, aligned to the real second boundary, and clean up on unmount.
4. The whole clock is **one image** for assistive tech: `role="img"` and an accessible name such as "Current time 3:45 PM". Its parts are hidden from the accessibility tree. Don't announce every tick.
5. The clock scales with its container (use `viewBox`).
6. Accept an optional `size` prop (default 240 px).

## Follow-up

- When the second hand goes from 59 to 0, a CSS transition spins it backwards the whole way round. How do you avoid that?
- Smooth sweeping hands: `requestAnimationFrame`, CSS animation, or something else?
- How would you show a different time zone?
