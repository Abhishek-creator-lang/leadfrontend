## TL;DR

Typical real-world uses: **event-handler factories** (`handleChange('email')`), **configured utilities** (loggers, formatters, API clients), **predicate builders** for `filter`/`find`, **validators**, **middleware** (Redux, Express), and **function pipelines**. The pattern is always the same: supply the stable, configuration-like arguments early, and the changing data last.

## 1. Event-handler factory (React)

```jsx
function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <>
      <input value={form.name} onChange={update('name')} />
      <input value={form.email} onChange={update('email')} />
    </>
  );
}
```

One curried function replaces a handler per field.

## 2. Scoped logger

```js
const createLogger = (scope) => (level) => (message, data) =>
  console[level](`[${scope}] ${message}`, data ?? '');

const checkoutLog = createLogger('checkout');
const warn = checkoutLog('warn');
warn('Card declined', { code: 'insufficient_funds' });
```

## 3. Predicate builders

```js
const propEq = (key) => (value) => (obj) => obj[key] === value;
const byStatus = propEq('status');

orders.filter(byStatus('shipped'));
users.find(propEq('id')(42));

const priceBetween = (min, max) => (p) => p.price >= min && p.price <= max;
products.filter(priceBetween(10, 50));
```

## 4. Configured API client (partial application)

```js
async function apiRequest(baseUrl, token, method, path, body) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
  return res.json();
}

const api = apiRequest.bind(null, 'https://api.example.com', session.token);
const get = (path) => api('GET', path);
const post = (path, body) => api('POST', path, body);

await post('/orders', { sku: 'A1', qty: 2 });
```

## 5. Composable validators

```js
const minLength = (n) => (v) => (v.length >= n ? null : `Must be at least ${n} characters`);
const matches = (re, msg) => (v) => (re.test(v) ? null : msg);
const validate = (...rules) => (value) => rules.map((r) => r(value)).filter(Boolean);

const validatePassword = validate(minLength(12), matches(/\d/, 'Needs a digit'));
validatePassword('short'); // ['Must be at least 12 characters', 'Needs a digit']
```

## 6. Middleware signatures

```js
// Redux middleware is curried by design
const logger = (store) => (next) => (action) => {
  console.log('dispatching', action.type);
  return next(action);
};

// Express: configure once, return the handler
const requireRole = (role) => (req, res, next) =>
  req.user?.roles.includes(role) ? next() : res.status(403).end();
app.delete('/users/:id', requireRole('admin'), deleteUser);
```

## 7. Pipelines

```js
const map = (fn) => (arr) => arr.map(fn);
const filter = (fn) => (arr) => arr.filter(fn);
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const activeEmails = pipe(filter(byStatus('active')), map((u) => u.email.toLowerCase()));
activeEmails(users);
```

## 8. Fixing a mismatched callback signature

```js
['10', '20', '30'].map(parseInt);               // [10, NaN, NaN]: index passed as radix
['10', '20', '30'].map((s) => parseInt(s, 10)); // [10, 20, 30]
```

## Practical guidance

- Order parameters **config first, data last** so they curry naturally.
- Name intermediate functions (`byStatus`, `checkoutLog`): good names make the style readable.
- Don't create curried handlers inside hot render paths of memoized children without `useCallback`/`useMemo`, as each call returns a new function.

## In an interview, mention…

- Two or three of these from your own experience, with why they improved the code.
- Middleware as a widely used curried API.
- The data-last convention and keeping it readable for the team.
