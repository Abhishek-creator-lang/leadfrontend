## TL;DR

A **Progressive Web App** is a website built with standard web tech that can **behave like an installed app**: it can be **installed** to the home screen/dock, **work offline or on flaky networks**, receive **push notifications**, and launch in its own window. The technical minimum is **HTTPS, a Web App Manifest and (usually) a service worker**. "Progressive" means it works as a normal site everywhere and adds capabilities where the browser supports them.

## The building blocks

**1. Web App Manifest** (`manifest.webmanifest`, linked with `<link rel="manifest">`)

```json
{
  "name": "Trail Notes",
  "short_name": "Trails",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0b5",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

It defines name, icons, launch URL, display mode (standalone, fullscreen, minimal-ui) and colours for the splash screen.

**2. Service worker**: a script that runs off the main thread and can intercept network requests from your pages.

```js
// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
const CACHE = 'shell-v3';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/app.js', '/app.css', '/offline.html'])));
});
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/offline.html')));
  }
});
```

Caching strategies: cache-first for versioned static assets, network-first for HTML/API data, stale-while-revalidate for content that can be slightly old. Workbox packages these patterns.

**3. HTTPS**: required for service workers (localhost is exempt).

## Capabilities a PWA can use

- Offline support and background sync (Background Sync is Chromium-only).
- Push notifications via the Push API and Notifications API. On iOS/iPadOS, web push works only for PWAs added to the home screen (since iOS 16.4).
- App badging, share target, file handling, shortcuts in the manifest.
- Install prompts: Chromium fires `beforeinstallprompt`; Safari requires the user to use "Add to Home Screen"/"Add to Dock".

## Benefits and trade-offs

| Benefits | Limitations |
|---|---|
| One codebase, no app-store review, instant updates | Uneven capabilities across browsers, especially iOS |
| Linkable and indexable like a website | No access to some native APIs (deep OS integration, some sensors) |
| Small install size, fast repeat loads from cache | Storage can be evicted under pressure (request `navigator.storage.persist()`) |
| Works on slow networks | Service worker bugs can serve stale content to every user |

## Service worker pitfalls

- **Update flow**: a new service worker waits until all tabs close. Use `skipWaiting()`/`clients.claim()` deliberately and show an "update available" prompt rather than swapping assets under a running page.
- **Never cache `sw.js` itself** with long HTTP cache lifetimes.
- Keep a **kill switch**: a no-op worker you can deploy if a bad one ships.
- Version caches and delete old ones in `activate`.

## In an interview, mention…

- Manifest + service worker + HTTPS as the core.
- Caching strategies per resource type and the update lifecycle.
- Platform gaps (iOS push and install UX) and progressive enhancement.
- Measurable wins: repeat-visit performance, offline resilience, re-engagement.
