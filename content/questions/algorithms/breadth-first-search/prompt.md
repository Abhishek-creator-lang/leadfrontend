Your team wants to know how many clicks a user needs to get from one page of a web app to another. Write `breadthFirstSearch(links, from, to)`, which returns the **shortest path** of pages from `from` to `to` (both included), or `null` if `to` is unreachable.

`links[page]` lists the pages that `page` links to. Links are one-way. A page with no key has no outgoing links.

```js
const links = {
  home: ['products', 'help'],
  products: ['product-42', 'cart'],
  'product-42': ['cart'],
  cart: ['checkout'],
  help: ['contact'],
};

breadthFirstSearch(links, 'home', 'checkout');
// ['home', 'products', 'cart', 'checkout']  (3 clicks)

breadthFirstSearch(links, 'home', 'home');     // ['home']
breadthFirstSearch(links, 'help', 'checkout'); // null
```

## Requirements

- The returned path must be a **shortest** one (fewest links followed).
- When several shortest paths exist, any of them is accepted.
- Graphs may contain cycles.

## Constraints

- O(V + E) time; graphs can have tens of thousands of pages.

## Follow-up

- Why does BFS find shortest paths but DFS doesn't?
- What would you use if links had different costs (e.g. load time)?
