The same-origin policy restricts how a document or script from one origin can interact with resources from another origin. Two URLs have the same origin when their URI scheme, hostname, and port number match.

Browsers generally allow some cross-origin writes and resource embedding, but prevent scripts from reading cross-origin responses or accessing another origin's DOM. A server can selectively allow a script to read a cross-origin response through Cross-Origin Resource Sharing (CORS).

The same-origin policy does not prevent Cross-Site Request Forgery (CSRF), because a browser can still send cross-origin requests with ambient credentials such as cookies. CSRF defenses include `SameSite` cookies, CSRF tokens, and origin checks.

- https://owasp.org/www-community/attacks/csrf
