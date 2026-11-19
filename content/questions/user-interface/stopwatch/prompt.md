Build a stopwatch.

## Requirements

1. The display shows elapsed time as `MM:SS.cc` (minutes, seconds, hundredths), starting at `00:00.00`. From one hour onwards, show `H:MM:SS.cc`.
2. A primary button toggles **Start** / **Stop**. Stopping freezes the display. Starting again continues from where it stopped.
3. A secondary button:
   - shows **Lap** while running, and records the current split
   - shows **Reset** while stopped, and clears the time and laps. It's disabled at `00:00.00`.
4. Laps appear in a numbered list, newest first, showing each lap's own duration ("Lap 2 — 00:03.41").
5. The time must be **accurate**: after 60 real seconds it must read 60 seconds, even if the tab was in the background or the main thread was busy.
6. Accessibility: the display uses `role="timer"`. Buttons have clear names. Keyboard shortcuts are optional, but don't hijack keys while the user is typing in a field.

## Follow-up

- Why is "add 10 ms every 10 ms" wrong?
- `setInterval` or `requestAnimationFrame` for updating the display?
- `Date.now()` or `performance.now()`?
