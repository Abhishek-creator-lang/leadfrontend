Implement `dropWhile(array, predicate)`. Starting from the **beginning** of `array`, it skips elements while `predicate` returns a truthy value. As soon as the predicate returns a falsy value, that element and **everything after it** are returned in a new array.

```js
dropWhile([1, 2, 3, 4, 1], (n) => n < 3); // [3, 4, 1]
dropWhile([5, 1, 2], (n) => n < 3); // [5, 1, 2]  (first element already fails)
dropWhile([1, 2], (n) => n < 3); // []

const lines = ['', '  ', 'title', '', 'body'];
dropWhile(lines, (line) => line.trim() === ''); // ['title', '', 'body']
```

## Requirements

- `predicate` is called as `predicate(value, index, array)`.
- Stop calling `predicate` as soon as it returns a falsy value. Elements after that point are kept even if they would pass (the trailing `1` above).
- Return a new array. Don't mutate the input.

## Follow-up

- How does `dropWhile` differ from `filter` with the negated predicate?
- How would you write `takeWhile`, its mirror image?
