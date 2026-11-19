Many back ends return `snake_case` JSON while JavaScript code uses `camelCase`. Implement `camelCaseKeys(value)`, which returns a **new** value where every key of every plain object, at any depth, has been converted to camelCase.

```js
camelCaseKeys({
  user_id: 7,
  display_name: 'Ada',
  recent_orders: [{ order_id: 1, line_items: [{ sku_code: 'X' }] }],
  created_at: new Date(0),
});
// {
//   userId: 7,
//   displayName: 'Ada',
//   recentOrders: [{ orderId: 1, lineItems: [{ skuCode: 'X' }] }],
//   createdAt: <the same Date instance>,
// }
```

## Key conversion rules

- Each run of one or more underscores that has a character **on both sides** is removed, and the character after it is upper-cased:
  `first_name` becomes `firstName`, `a_b_c` becomes `aBC`, and `double__under` becomes `doubleUnder`.
- **Leading and trailing underscores are kept**: `_private` and `id_` are unchanged.
- No other characters change, so `already_Camel` becomes `alreadyCamel` and `HTTP_code` becomes `HTTPCode`.

## Value rules

- **Plain objects** (prototype `Object.prototype` or `null`) get new keys, and their values are processed recursively.
- **Arrays** are mapped item by item, recursively.
- Everything else (primitives, `null`, `Date`, `Map`, class instances, functions) is returned **as is**, by reference.
- The input must not be mutated.

## Follow-up

- What should happen if two keys collide after conversion (`a_b` and `aB`)?
- How would you write the inverse, `snakeCaseKeys`, and is the round trip lossless?
- Where should this conversion live in a front-end codebase?
