Extend the download manager from *Progress Bars II* (each bar takes **2 seconds**, at most **3** run at once, the rest are queued) with global controls.

## Requirements

1. **Add** appends a bar, as before. The concurrency limit of 3 still applies.
2. **Pause** freezes every running bar exactly where it is. The button becomes **Resume**, and resuming continues from the same percentage. It must **not** restart from 0 or jump ahead by the paused time.
3. Bars added while paused are queued and don't start until you resume.
4. **Reset** removes every bar and leaves the manager running (not paused).
5. Expose the toggle state accessibly. The Pause/Resume button's name changes with its action, and the summary ("Paused · 2 running · 3 queued · 1 done") is visible text.
6. Each bar: `role="progressbar"`, `aria-valuenow`, a label "Download N", and `aria-valuetext="Queued"` while waiting.
7. Use a single animation loop for all bars, not one per bar, and stop it whenever there's nothing to animate.

## Follow-up

- Why does pause and resume push you towards a central clock?
- What should happen when the tab is hidden? Should hidden time count?
- How would you test this without fake timers?
