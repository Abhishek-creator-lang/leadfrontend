You're building the suggestion engine for a command palette. Implement a `Trie` (prefix tree) class that stores words and answers prefix queries quickly.

```js
const commands = new Trie();
commands.insert('open file');
commands.insert('open folder');
commands.insert('open recent');
commands.insert('close');

commands.has('open file');       // true
commands.has('open');            // false (only a prefix, not a stored word)
commands.hasPrefix('open f');    // true
commands.complete('open f');     // ['open file', 'open folder']
commands.remove('open file');    // true
commands.complete('open f');     // ['open folder']
commands.size();                 // 3
```

## API

| Method | Returns | Description |
|---|---|---|
| `insert(word)` | `boolean` | Stores `word`; returns `false` if it was already stored. |
| `has(word)` | `boolean` | Whether `word` itself was stored. |
| `hasPrefix(prefix)` | `boolean` | Whether any stored word starts with `prefix`. `hasPrefix('')` is `true` if the trie is non-empty. |
| `complete(prefix)` | `string[]` | All stored words starting with `prefix`, sorted alphabetically (by UTF-16 code unit, like the default `Array.prototype.sort`). |
| `remove(word)` | `boolean` | Removes `word`; returns `false` if it wasn't stored. Other words sharing its prefix must be unaffected. |
| `size()` | `number` | Number of stored words. |

## Constraints

- Words are non-empty strings of any characters (spaces, punctuation, mixed case). Matching is case-sensitive.
- `has`, `hasPrefix`, `insert` and `remove` must be O(L) for a word of length L, independent of how many words are stored.

## Follow-up

- How would you limit `complete` to the top 5 results by usage frequency?
- How does a trie compare with a sorted array plus binary search for this use case?
