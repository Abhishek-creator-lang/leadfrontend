A site's pages link to each other. Write `depthFirstSearch(links, start)`, which crawls the site **depth-first** from `start` and returns the pages in the order they're first visited.

`links` is an adjacency list: `links[page]` is an array of the pages it links to, in the order they appear on the page. Links are one-way.

Depth-first means: visit a page, then fully explore its **first** unvisited link before moving on to its second link, and so on. Each page is visited at most once.

```js
const links = {
  home: ['blog', 'about'],
  blog: ['post-1', 'post-2'],
  'post-1': ['home'],
  'post-2': [],
  about: ['team'],
  team: [],
};

depthFirstSearch(links, 'home');
// ['home', 'blog', 'post-1', 'post-2', 'about', 'team']

depthFirstSearch(links, 'about'); // ['about', 'team']
```

## Requirements

- Follow links in the order they're listed.
- A page with no key in `links` has no outgoing links.
- If `start` is not a key in `links` and isn't linked from anywhere, return `[start]`.
- Graphs can contain cycles and self-links.

## Constraints

- O(V + E) time. Graphs may have thousands of pages and dense linking.

## Follow-up

- Write it both recursively and iteratively. What changes in the iterative version to keep the same order?
- How would you detect whether the crawl ever returns to a page it is currently "inside" (a cycle)?
