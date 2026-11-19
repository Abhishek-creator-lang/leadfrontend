## TL;DR

SQL injection happens when **user input is concatenated into a SQL string**, so the input can change the query's structure (`' OR '1'='1`). It's a **server-side** problem: in JavaScript apps it lives in **Node.js** APIs, serverless functions, SSR/server actions, or anywhere JS talks to a database. The fix is **parameterized queries** (placeholders with values sent separately), or ORMs/query builders that parameterize for you, plus **allowlisting identifiers**, **least-privilege DB accounts**, and server-side **validation**. Client-side checks don't help, because attackers call your API directly.

## The vulnerability

```js
// Express + node-postgres: DON'T
app.get('/users', async (req, res) => {
  const sql = `SELECT * FROM users WHERE email = '${req.query.email}'`;
  const { rows } = await pool.query(sql);
  res.json(rows);
});
// ?email=' OR '1'='1  → returns every user
// ?email='; DROP TABLE users; --  → if multiple statements are allowed
```

## Parameterized queries

```js
// node-postgres: $1, $2 placeholders
const { rows } = await pool.query(
  'SELECT id, email FROM users WHERE email = $1 AND tenant_id = $2',
  [req.query.email, req.user.tenantId]
);

// mysql2: ? placeholders, use execute() for real prepared statements
const [rows] = await conn.execute('SELECT id FROM orders WHERE user_id = ?', [userId]);

// better-sqlite3
db.prepare('INSERT INTO notes (user_id, body) VALUES (?, ?)').run(userId, body);
```

The driver sends the SQL and the values separately (or escapes values correctly for the protocol), so input is always data, never syntax.

## ORMs and query builders

```js
// Prisma
await prisma.user.findMany({ where: { email } });

// Prisma raw SQL: the tagged template is parameterized…
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
// …but the "Unsafe" variant is not:
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`); // vulnerable

// Knex / Drizzle / Kysely build parameterized SQL
await knex('users').where({ email }).select('id');
```

Tagged-template SQL libraries (`postgres`/porsager, `sql` helpers in Drizzle/Kysely, Vercel's `sql`) are safe *because* they're tagged templates; calling them with a pre-built string defeats that.

## Things placeholders can't parameterize

Table names, column names, sort direction and `LIMIT` syntax in some drivers can't be bound as values. **Allowlist** them:

```js
const SORTABLE = new Set(['created_at', 'price', 'name']);
const column = SORTABLE.has(req.query.sort) ? req.query.sort : 'created_at';
const dir = req.query.dir === 'asc' ? 'ASC' : 'DESC';
const { rows } = await pool.query(
  `SELECT * FROM products ORDER BY ${column} ${dir} LIMIT $1`,
  [Math.min(Number(req.query.limit) || 20, 100)]
);
```

`LIKE` patterns: bind the value, and escape `%`/`_` if users shouldn't use wildcards.

## Defence in depth

- **Validate input** with a schema (Zod, Valibot, JSON Schema) at the API boundary: types, lengths, formats. This reduces attack surface but is *not* a substitute for parameterization.
- **Least privilege**: the app's DB user shouldn't be able to `DROP` tables or read other schemas. Use separate read-only users where possible.
- **Disable multiple statements** in drivers that allow them (`multipleStatements: false` is the mysql default; keep it).
- **Don't leak SQL errors** to clients; log them server-side.
- **Row-level authorization**: always scope queries by the authenticated user/tenant (`WHERE tenant_id = $n`) to prevent IDOR-style data access.
- **Tooling**: ESLint security plugins, Semgrep/CodeQL rules for string-built queries, and DAST scanners (OWASP ZAP, sqlmap in authorised testing).

## NoSQL injection too

MongoDB queries built from raw JSON can be manipulated with operators:

```js
// body: { "email": "a@b.com", "password": { "$ne": null } }
await users.findOne({ email: req.body.email, password: req.body.password }); // bypass!
```

Validate that values are strings (schema validation), or use sanitizers like `express-mongo-sanitize`.

## In an interview, mention…

- It's a server-side concern even in "JavaScript apps"; client validation doesn't count.
- Parameterized queries/ORMs as the fix, and the unsafe escape hatches (`$queryRawUnsafe`, string-built `raw`).
- Allowlisting identifiers, least privilege, schema validation and NoSQL operator injection.
