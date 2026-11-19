Implement `numberOfArguments()`. It returns the number of arguments it was **called with**, whatever they are.

```js
numberOfArguments();                 // 0
numberOfArguments(1, 2, 3);          // 3
numberOfArguments(undefined);        // 1  -> an explicit undefined still counts
numberOfArguments(...[1, , 3]);      // 3  -> spreading a sparse array passes undefined for the hole
numberOfArguments.apply(null, ['a', 'b']); // 2
```

## Requirements

- Count arguments that were **passed**, including explicit `undefined` and `null` values.
- Work whether the function is called directly, with `call`/`apply`, or with spread syntax.
- The function itself takes no declared parameters. Be ready to explain why `numberOfArguments.length` is `0` whatever it is called with.

This is a warm-up question. The interesting part is the discussion: `arguments` vs rest parameters vs `Function.prototype.length`.

## Follow-up

- Why doesn't `arguments` exist inside arrow functions?
- What does `((a, b = 2, ...rest) => {}).length` return, and why?
- Why is `arguments` described as "array-like", and how do you turn it into a real array?
