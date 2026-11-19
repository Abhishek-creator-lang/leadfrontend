## TL;DR

**Input validation** checks that data entering your system has the **expected type, format, length and range** before you use it, rejecting anything else. It's important for security because many attacks (injection, XSS, path traversal, prototype pollution, denial of service via huge payloads) start with **unexpected input**. Rules: **validate on the server** (client-side validation is only UX), prefer **allowlists** over blocklists, validate **at every trust boundary** with a schema, and pair validation with **context-specific output encoding and parameterized queries**, because valid data can still be dangerous in the wrong context.

## Client vs server

```js
// client: instant feedback, can be bypassed with DevTools, curl or a script
<input type="email" required maxLength={254} />

// server: the actual security control
app.post('/api/profile', (req, res) => {
  const result = ProfileSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
  saveProfile(req.user.id, result.data); // only validated, typed data goes further
});
```

Anything that reaches your API can be crafted by an attacker; front-end checks never count as a defence.

## Schema validation at the boundary

```js
import { z } from 'zod';

const ProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(50),
  website: z.string().url().max(200).refine((u) => /^https?:/i.test(u), 'Must be http(s)').optional(),
  age: z.number().int().min(13).max(130),
  role: z.enum(['viewer', 'editor']),   // allowlist; never accept "admin" from the client
}).strict();                             // reject unknown keys (mass-assignment protection)
```

- **Type and shape** (reject objects where strings are expected; this stops NoSQL operator injection like `{ "$ne": null }`).
- **Length and size limits** on strings, arrays and request bodies (`express.json({ limit: '100kb' })`).
- **Formats** with well-tested validators; beware regexes that can backtrack catastrophically (ReDoS).
- **Allowlists** for enums, sort columns, file types, redirect targets.
- **Unknown fields** rejected, so clients can't set `isAdmin` or `price` (mass assignment).

The same schema can run in the browser for UX and on the server for enforcement, and TypeScript types can be inferred from it.

## Allowlist vs blocklist

```js
// blocklist: always incomplete
if (filename.includes('../')) reject(); // bypass: '..%2f', '..\\', unicode tricks

// allowlist: define what's allowed
const SAFE_NAME = /^[a-z0-9_-]{1,64}\.(png|jpe?g|webp)$/i;
if (!SAFE_NAME.test(filename)) reject();
```

For file paths, also resolve and check that the final path stays inside the intended directory.

## Validation is not encoding

Valid input can still be harmful when used in a different context:

- An allowed display name like `O'Brien` breaks string-built SQL; use **parameterized queries**.
- A valid comment containing `<b>` is fine as text but dangerous in `innerHTML`; **encode on output** or sanitize HTML.
- A valid URL can still be `javascript:…` unless you check the protocol.

So validation reduces attack surface; encoding and safe APIs at the point of use prevent injection.

## Other inputs to validate

- **Files**: check size, real content type (magic bytes, not just extension or the client's `Content-Type`), re-encode images, store outside the web root, scan if needed.
- **Headers, cookies and URL parameters**: all attacker-controlled.
- **`postMessage` data and third-party API responses**: validate shape before trusting them.
- **JSON merging**: reject `__proto__`, `constructor` and `prototype` keys or use `Object.create(null)`/`Map`, to prevent prototype pollution.
- **Business rules**: quantity > 0, discount codes belonging to the user, resource IDs owned by the caller (authorization is a form of validation too).

## Handling invalid input

- Reject with a clear `400`/`422` and field-level messages; don't try to "fix" malicious input silently.
- Normalise before validating (Unicode normalisation, trimming), so checks and later use see the same value.
- Log suspicious patterns for monitoring without logging sensitive values.

## In an interview, mention…

- Server-side enforcement; client validation is UX.
- Schema validation (Zod, Valibot, JSON Schema/Ajv) with allowlists, limits and strict unknown-key handling.
- Validation vs output encoding vs parameterization: each prevents different things.
- Edge cases: files, prototype pollution, ReDoS, mass assignment.
