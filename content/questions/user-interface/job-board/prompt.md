Build a **job board** that lists the latest job postings from a Hacker News-style API.

`api.js` is a **mock** that stands in for the real Hacker News endpoints:

| Mock | Real endpoint |
|---|---|
| `fetchJobIds()` → `Promise<number[]>` | `GET /v0/jobstories.json` (newest first) |
| `fetchJob(id)` → `Promise<{ id, by, title, time, url? }>` | `GET /v0/item/<id>.json` |

The real API differs in that you call `fetch`, check `response.ok`, parse JSON, and may get `null` for deleted items. `time` is in Unix **seconds**. The mock has 15 jobs, and some have no `url`. Set `mockOptions.failIds` / `failItems` to simulate failures.

## Requirements

1. On load, fetch the list of ids **once**, then fetch details for the first **6** jobs.
2. Fetch each page's job details **in parallel**, not one after another. Show the page only when all of its jobs have arrived, so cards don't pop in out of order.
3. Each job card shows:
   - the title, as a link to `url` (opening in a new tab) when there is one, or as plain text when there isn't
   - `By <author> · <date>`, with the date formatted for the user's locale from `time`
4. A **Load more jobs** button fetches the next 6. While a page is loading, the button reads `Loading…` and is disabled. Hide it when there are no more jobs.
5. Show a loading message before the first page. If a request fails, show an error (`role="alert"`) with a **Retry** button that repeats the failed step.
6. No state updates after unmount, and no duplicate pages from double clicks.
7. Accessibility:
   - Jobs are a list (`<ul>`/`<li>`) of `<article>`s. External links say they open in a new tab.
   - When a page loads, announce `Loaded 6 more jobs`. Keyboard focus must not jump.

## Follow-up

- How would you cache the ids and pages so going back to the board is instant?
- The real `jobstories.json` returns ~200 ids. What if you need search or filters?
- Some items come back `null`. How should pagination handle that?
