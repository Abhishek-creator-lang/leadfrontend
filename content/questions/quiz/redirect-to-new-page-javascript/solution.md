## TL;DR

Assign to **`location.href`** (or call **`location.assign(url)`**) to navigate and keep the current page in history. Use **`location.replace(url)`** when the user shouldn't be able to go Back to the current page (after login, or when correcting a URL). In an SPA, don't reload at all: use the router (`history.pushState` under the hood). And whenever possible, **redirect on the server** (HTTP 301/302/303/307/308) rather than in JavaScript.

## The options

```js
location.href = '/dashboard';           // navigate, adds history entry
location.assign('/dashboard');          // same, as a method
location.replace('/login');             // navigate, replaces current entry
location.reload();                      // reload current URL

window.open('https://example.com', '_blank', 'noopener'); // new tab/window
window.top.location.href = '/break-out';                   // from inside an iframe
```

Relative URLs resolve against the current document's base URL. Build complex URLs with `new URL()` so parameters are encoded:

```js
const next = new URL('/search', location.origin);
next.searchParams.set('q', userQuery);
location.assign(next);
```

## assign vs replace

| | `assign` / `href =` | `replace` |
|---|---|---|
| New history entry | Yes | No |
| Back button returns here | Yes | No |
| Typical use | Normal navigation | Post-login redirect, auth guard, canonicalising a URL |

If an auth guard uses `assign`, Back takes the user to the protected page, which immediately redirects again, trapping them in a loop. `replace` avoids that.

## In single-page apps

A full navigation throws away JS state and reloads the bundle. Use the router instead:

```js
// React Router
const navigate = useNavigate();
navigate('/orders/42', { replace: true });

// Next.js App Router (client)
router.push('/orders/42');
// Next.js server components/actions
redirect('/login');
```

## Server-side redirects are usually better

- They happen before any HTML is downloaded, so they're faster.
- Search engines understand status codes: **301/308** for permanent moves (passes ranking signals), **302/307** temporary, **303** "see other" after a POST (the Post/Redirect/Get pattern prevents form resubmission).
- They work without JavaScript.

`<meta http-equiv="refresh" content="0; url=/new">` exists as a last-resort HTML redirect but is worse for accessibility and SEO.

## Security: open redirects

Never redirect to a URL taken straight from user input:

```js
// /login?next=https://evil.example → phishing
const next = new URLSearchParams(location.search).get('next');
const target = new URL(next ?? '/', location.origin);
location.assign(target.origin === location.origin ? target : '/');
```

Also block `javascript:` URLs; assigning `location.href = 'javascript:…'` executes code, which turns an open redirect into XSS. Validating that the resolved origin equals your own handles both.

## In an interview, mention…

- `assign` vs `replace` and the history implications.
- Router navigation in SPAs instead of full reloads.
- Prefer server status codes (301/302/303/307/308) and know when each applies.
- Open-redirect and `javascript:` URL validation.
