Build a digital clock that shows the current local time and updates every second.

## Requirements

1. Display the time as `HH:MM:SS` (24-hour, zero-padded, e.g. `09:05:03`) inside a `<time>` element whose `dateTime` attribute holds a machine-readable value.
2. A **24-hour** toggle button (with `aria-pressed`) switches between `13:07:42` and `1:07:42 PM`. In 12-hour mode, midnight is `12:…:… AM` and noon is `12:…:… PM`.
3. Show the date underneath ("Tuesday, 17 November 2026"). Any readable format is fine.
4. The clock must tick **on the second boundary**. It shouldn't drift, lag up to a second behind the system clock, or skip seconds.
5. Clean up timers on unmount.
6. Don't announce every tick to screen readers.

## Follow-up

- Why can `setInterval(tick, 1000)` show the wrong second, or skip one?
- `toLocaleTimeString` or manual formatting? What changes for international users?
- How would you make the digits not jiggle as they change?
