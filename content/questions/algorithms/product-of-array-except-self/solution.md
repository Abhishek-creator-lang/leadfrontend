## Brute force

For each `i`, multiply every `j !== i`. That's O(n²), about 10¹⁰ multiplications for 10⁵ elements.

The "clever" brute force is to compute the total product and divide by `factors[i]`. It's O(n), but it's banned, and it breaks on zeros: `total / 0` is `NaN` or `Infinity`, and a single zero makes the total 0 for everyone.

## Optimal: prefix and suffix products

The product of everything except `i` splits into two parts:

```
out[i] = (product of factors[0..i-1]) × (product of factors[i+1..n-1])
             prefix product                 suffix product
```

1. **Left pass:** walk left to right with a running product `left` starting at 1. Write `out[i] = left`, then `left *= factors[i]`. After this pass, `out[i]` holds the prefix product.
2. **Right pass:** walk right to left with `right` starting at 1. Do `out[i] *= right`, then `right *= factors[i]`.

Writing **before** multiplying by `factors[i]` is what excludes the element itself.

Using the output array to hold the prefixes, with a single scalar for the suffix, gives O(1) extra space.

## Complexity

- **Time:** O(n), two passes.
- **Space:** O(1) extra, plus the O(n) output.

## Edge cases

- One zero: every position except the zero's gets 0, and the zero's position gets the product of the rest.
- Two or more zeros: everything is 0.
- Negative numbers: no special handling needed.
- Single element → `[1]` (empty product).
- Empty array → `[]`.
- JS gotcha: `0 * -5` is `-0`. `toEqual` treats `-0` and `0` as different (`Object.is`), so if you care, normalise with `|| 0`. The reference does this so the results compare cleanly.

## Talking through it in an interview

Mention division and why it fails on zeros. That shows judgement. Then write the prefix/suffix formula, draw two arrows over a four-element example, and finally fold the two auxiliary arrays into one output plus a scalar.

## Follow-ups

- **With division and zeros:** count the zeros. With 0 zeros use `total / x`; with exactly 1 zero, only the zero's position is non-zero (the product of the non-zero values); with 2 or more, everything is 0.
- **Prefix sums** are the additive version of the same idea. They're used for range-sum queries, such as totals between two dates in a chart, in O(1) after O(n) preprocessing.
- **Large products:** use `BigInt`, or work with logarithms if only relative sizes matter.
