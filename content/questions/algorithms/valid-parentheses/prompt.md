An in-browser code editor wants to underline unbalanced brackets. Write `isBalanced(code)`, which returns `true` if every bracket in `code` is properly matched.

There are three bracket pairs: `()`, `[]` and `{}`. Every other character (letters, spaces, operators, quotes) is ignored. A string is balanced when:

- every opening bracket is closed by the **same kind** of bracket, and
- brackets close in the **reverse order** they were opened (they nest properly).

```js
isBalanced('const f = (a) => { return [a, b]; }'); // true
isBalanced('if (x) { y[0] = (1 + 2); }');          // true
isBalanced('call(arr[0)]');                         // false (wrong nesting)
isBalanced('{ open: true');                         // false (never closed)
isBalanced('done) ');                               // false (closes without opening)
isBalanced('no brackets at all');                   // true
isBalanced('');                                     // true
```

## Constraints

- `code` can be up to 10⁶ characters long.
- Aim for O(n) time.
- You don't need to understand strings or comments in the code; treat every bracket character as a bracket.

## Follow-up

- How would you return the **index** of the first problem so the editor can underline it?
- If there were only one kind of bracket, could you avoid the stack?
