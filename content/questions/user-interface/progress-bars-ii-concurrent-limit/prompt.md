This builds on *Progress Bars*: each click on **Add** appends a bar that fills from 0% to 100% over **2 seconds**. Now the download manager has a bandwidth budget.

## Requirements

1. **At most 3 bars fill at the same time.** Extra bars wait, in the order they were added, and show "Queued".
2. When a running bar finishes, the oldest queued bar starts right away.
3. A queued bar sits at 0% and exposes that: `role="progressbar"`, `aria-valuenow="0"`, a label such as "Download 4". Running and finished bars expose their real progress.
4. A summary line reads "2 running · 4 queued · 1 done" and updates live.
5. **Clear** removes all bars and stops everything. No timers or animation frames are left running.

## Follow-up

- Where does "is this bar allowed to run?" live: in the bar or in the parent? Why?
- How would you make the limit configurable at runtime (for example, change it from 3 to 1 mid-run)?
- How does this map to a real upload queue with `fetch`?
