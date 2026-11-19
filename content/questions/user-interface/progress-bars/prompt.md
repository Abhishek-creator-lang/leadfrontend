Build a page with an **Add** button. Each click appends a new progress bar that fills from 0% to 100% over **2 seconds**. Bars added later start from 0 and run alongside the ones already filling.

## Requirements

1. The page starts with no bars and shows a short hint ("No downloads yet").
2. Each click on **Add** appends a bar that starts filling immediately. Several bars can fill at the same time, each on its own timeline.
3. Each bar exposes its real progress to assistive tech: `role="progressbar"`, `aria-valuenow` (0–100), and a label such as "Download 1".
4. When a bar reaches 100% it stays full and shows "Done".
5. A **Clear** button removes every bar.
6. No leaks: removing bars or unmounting the page must cancel any running timers or animation frames.

## Follow-up

- CSS transition or JavaScript animation? What does each one give you?
- What happens to your animation when the tab is in the background?
- Your bars must survive React Strict Mode's double-invoked effects. How do you know they do?
