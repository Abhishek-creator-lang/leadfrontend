## TL;DR

**Authentication** proves who the user is; **authorization** decides what they may do. In JavaScript apps: authenticate with a **proven protocol or provider** (OAuth 2.0/OpenID Connect with **Authorization Code + PKCE**, or a well-built session login), support **passkeys/MFA**, store sessions in **`HttpOnly; Secure; SameSite` cookies** (or keep tokens server-side via a **backend-for-frontend**), and **enforce authorization on the server for every request**. The front end only *reflects* permissions in the UI; it can never be the gatekeeper.

## Authentication options

**Server sessions (classic, robust)**

```http
POST /login → Set-Cookie: __Host-sid=<random id>; Path=/; Secure; HttpOnly; SameSite=Lax
```

The server keeps session state (Redis/DB). Easy revocation, no token handling in JS. Needs CSRF protection for state-changing requests (SameSite + tokens/Origin checks).

**OAuth 2.0 / OpenID Connect**

- Use **Authorization Code flow with PKCE**. The implicit flow (tokens in the URL fragment) is deprecated.
- Validate `state` (CSRF) and `nonce` (replay) parameters; libraries (`oidc-client-ts`, Auth.js, provider SDKs) handle this.
- Prefer the **BFF pattern**: your server performs the code exchange, stores access/refresh tokens, and gives the browser only a session cookie. Tokens never reach JavaScript, so XSS can't exfiltrate them.

**Tokens in a pure SPA (when no BFF)**

- Keep the **access token in memory**, short-lived (minutes).
- Use **refresh-token rotation** with reuse detection, ideally in an `HttpOnly` cookie scoped to the token endpoint.
- Avoid `localStorage` for long-lived credentials: any XSS can read it.

**JWT caveats**

- Verify signature, `exp`, `iss`, `aud` on the server; pin the algorithm (reject `alg: none` and unexpected algorithms).
- JWTs are hard to revoke; keep them short-lived or check a denylist/session version.
- Decoding a JWT on the client is fine for display, never for trust decisions.

## Strengthening login

- **Passkeys (WebAuthn)**: phishing-resistant, no shared secret to steal.

```js
const credential = await navigator.credentials.get({
  publicKey: optionsFromServer, // challenge, rpId, allowCredentials
});
await fetch('/webauthn/verify', { method: 'POST', body: JSON.stringify(serialize(credential)) });
```

- **MFA** (TOTP, WebAuthn) for sensitive accounts and actions; step-up re-authentication before changing email/password or making payments.
- **Passwords**: hashed server-side with Argon2id/bcrypt/scrypt; check against breached-password lists; rate limiting and lockout/backoff to stop brute force and credential stuffing; generic error messages ("invalid email or password").
- **Session management**: regenerate the session ID on login (prevents fixation), idle and absolute timeouts, server-side logout invalidation, "log out other devices".

## Authorization

Enforce on the server, close to the data:

```js
app.patch('/api/projects/:id', requireAuth, async (req, res) => {
  const project = await db.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.sendStatus(404);
  if (!can(req.user, 'update', project)) return res.sendStatus(403); // object-level check
  // validate body, then update…
});

function can(user, action, project) {
  if (user.role === 'admin') return true;
  return action === 'update' && project.ownerId === user.id;
}
```

- **Deny by default**; check every endpoint, including "hidden" admin APIs, GraphQL resolvers, server actions and file downloads.
- **Object-level checks** prevent IDOR (changing `/orders/123` to `/orders/124`). Broken access control is the top OWASP risk.
- Model permissions with **RBAC** (roles) or **ABAC/ReBAC** (attributes/relationships, e.g. "member of this workspace"); centralise policies in one module or service (CASL, OPA, Cedar, Zanzibar-style systems).
- Never trust client-sent roles, user IDs or prices; derive them from the session.

## The front end's role

```jsx
{can(user, 'delete', doc) && <button onClick={remove}>Delete</button>}
<Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />
```

Route guards and hidden buttons are **UX only**. Code and data shipped to the client are visible, so don't ship admin-only data to non-admins either. Handle 401 (redirect to login, preserving a validated return URL) and 403 (explain, don't loop).

## Supporting controls

HTTPS + HSTS, strict CSP (XSS undermines every client-side auth measure), CSRF protection for cookie sessions, rate limiting, audit logs for sensitive actions, and secure account recovery (recovery is often the weakest link).

## In an interview, mention…

- AuthN vs AuthZ, and server-side enforcement with object-level checks.
- Authorization Code + PKCE, the BFF pattern and token storage trade-offs.
- Passkeys/MFA, session hygiene, and password storage.
- Front-end guards as UX, plus XSS/CSRF as threats to whichever approach you pick.
