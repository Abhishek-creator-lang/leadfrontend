Dashboards often filter, sort and page through data on the client. Implement `selectData(rows, options)`, a tiny SQL-like query over an array of plain objects.

```js
const orders = [
  { id: 1, customer: 'ada', status: 'paid', total: 40 },
  { id: 2, customer: 'bob', status: 'refunded', total: 15 },
  { id: 3, customer: 'ada', status: 'paid', total: 90 },
  { id: 4, customer: 'cy', status: 'pending', total: 40 },
];

selectData(orders, {
  where: { status: ['paid', 'pending'], total: (t) => t >= 40 },
  orderBy: ['-total', 'id'],
  limit: 2,
  select: ['id', 'total'],
});
// [{ id: 3, total: 90 }, { id: 1, total: 40 }]
```

## Options (all optional)

| Option | Meaning |
|---|---|
| `where` | An object of conditions; a row must satisfy **all** of them. For each `field: condition`: a **function** is called with the row's field value and must return truthy; an **array** means the value must be one of its elements (`includes`); anything else means strict equality (`===`). |
| `orderBy` | A field name or an array of field names. A leading `-` sorts that field in descending order. Later fields break ties of earlier ones. |
| `offset` | Number of rows to skip after sorting (default `0`). |
| `limit` | Maximum number of rows to return (default: no limit). |
| `select` | Array of field names. Each result row is a **new** object containing only those fields. Fields the row doesn't have are left out. |

Operations happen in this order: `where`, `orderBy`, `offset`, `limit`, `select`.

## Sorting rules

- Compare values with `<` and `>` (numbers numerically, strings by code unit).
- `null` and `undefined` always sort **last**, in both ascending and descending order.
- Sorting is **stable**: rows that compare equal on every key keep their original relative order.

## Requirements

- Never mutate `rows` or the row objects.
- With no options, return a shallow copy of `rows`.

## Follow-up

- Why does the order of operations matter for `limit` and `orderBy`?
- How would you sort strings in a locale-aware, case-insensitive way?
- At what data size would you move this work to the server?
