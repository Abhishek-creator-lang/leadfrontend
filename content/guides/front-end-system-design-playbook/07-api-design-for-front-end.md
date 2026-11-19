---
title: API design for the front end
description: Designing the server contracts and component APIs that front end systems depend on, covering REST vs GraphQL, pagination, real-time transports, errors, and props design.
source: original
---
The **I** in RADIO is where your design becomes concrete. Interviewers want to see that you can define the contract between the client and server, and between components, in enough detail that another engineer could build against it. Front end engineers are API *consumers* every day, and senior ones increasingly shape those APIs through BFFs, GraphQL schemas, and design-system component APIs.

## Two kinds of interfaces

| Interface | Between | Examples |
| --- | --- | --- |
| Network API | Client and server | `GET /feed`, GraphQL query, WebSocket events |
| Component API | Components and their consumers | Props, callbacks, slots, imperative handles |

In application questions, spend more time on the network API. In component questions (autocomplete, modal, data table), the component API *is* the main event.

## Choosing an API style

| Style | Strengths | Weaknesses | Choose when |
| --- | --- | --- | --- |
| REST (JSON) | Simple, cacheable with HTTP, universal tooling | Over- and under-fetching, many round trips for nested data | Resource-oriented CRUD, public APIs, CDN caching matters |
| GraphQL | Client picks fields, one round trip, typed schema | Harder HTTP caching, query cost control, more infrastructure | Many clients with different needs, deeply nested data |
| tRPC / typed RPC | End-to-end types with no codegen | Couples client and server (TypeScript monorepo) | Full-stack TS apps owned by one team |
| BFF (any style) | Shapes data per client, hides microservice sprawl | Another service to run | Many backend services, mobile and web diverge |

In an interview, pick one, justify it in one sentence, and move on. "REST with a BFF that returns view-shaped responses, because the feed aggregates four services and we want one round trip on mobile."

## Designing endpoints

Show realistic request and response shapes:

```http
GET /api/v1/feed?cursor=eyJ0IjoxNzA...&limit=20
Accept: application/json

200 OK
Cache-Control: private, max-age=0
{
  "items": [
    {
      "id": "p_123",
      "author": { "id": "u_9", "name": "Asha", "avatarUrl": "https://cdn.../a.webp" },
      "text": "Shipping day!",
      "media": [{ "url": "https://cdn.../1.avif", "width": 1080, "height": 1350, "alt": "Team photo" }],
      "likeCount": 41,
      "viewerHasLiked": false,
      "createdAt": "2025-03-02T10:15:00Z"
    }
  ],
  "nextCursor": "eyJ0IjoxNzA...",
  "hasMore": true
}
```

Details that score points:

- **Media dimensions** in the payload, so the client can reserve space (no CLS).
- **Viewer-specific fields** (`viewerHasLiked`) so the client doesn't need a second request.
- **Opaque cursors**, so the server can change its pagination strategy.
- **ISO timestamps in UTC**; format on the client per locale.

## Pagination

| Type | How | Pros | Cons | Use for |
| --- | --- | --- | --- | --- |
| Offset | `?page=3&limit=20` | Jump to page N, simple | Duplicates or skips when data changes; slow deep offsets | Admin tables, search results with page numbers |
| Cursor | `?cursor=abc&limit=20` | Stable under inserts, efficient | No random access | Feeds, chats, infinite lists |
| Keyset / time-based | `?before=2025-03-01T...` | Transparent, efficient | Needs a unique sortable key | Message history, logs |

For chat, mention **bidirectional** pagination: load older messages upward, and catch up on newer ones after reconnecting.

## Mutations

```http
POST /api/v1/posts/p_123/likes
Idempotency-Key: 7f9c2e1a-...

200 OK
{ "likeCount": 42, "viewerHasLiked": true }
```

- **Return the updated resource** (or the fields that changed) so the client can reconcile its optimistic state.
- **Idempotency keys** for anything that may be retried (payments, message sends).
- **Client-generated ids** for optimistic creates, mapped to server ids in the response.

## Error contract

Agree on one error shape across endpoints:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfterMs": 3000,
    "fields": { "email": "Already in use" }
  }
}
```

| HTTP status | Client behavior |
| --- | --- |
| 400 / 422 | Show field-level validation errors; don't retry |
| 401 | Refresh token once, then redirect to login |
| 403 | Show a permission message; don't retry |
| 404 | Show not-found UI; remove from cache |
| 409 | Conflict: refetch and ask the user to resolve |
| 429 | Back off using `Retry-After` |
| 5xx / network | Retry with exponential backoff and jitter; show offline or retry UI |

## Real-time transports

| Transport | Direction | Pros | Cons | Use for |
| --- | --- | --- | --- | --- |
| Short polling | Client pulls | Simplest, works everywhere | Wasteful, adds latency | Low-frequency updates (every 30–60s) |
| Long polling | Client pulls, server holds | Works through most proxies | Connection churn | Fallback |
| Server-Sent Events | Server to client | HTTP-based, auto-reconnect, simple | One-way; per-domain connection limits on HTTP/1.1 | Notifications, live feeds, AI token streaming |
| WebSocket | Bidirectional | Low latency, full duplex | Stateful servers, custom reconnect and heartbeat logic | Chat, collaboration, games |
| WebTransport | Bidirectional (HTTP/3) | Multiple streams, unreliable datagrams | Newer; check current browser support | Media, gaming (niche) |

Describe the event schema, not just the transport:

```ts
type ServerEvent =
  | { type: 'message.created'; message: Message }
  | { type: 'message.read'; conversationId: string; readerId: string; upTo: string }
  | { type: 'typing'; conversationId: string; userId: string };
```

And the reconnect story: exponential backoff, resume from a `lastEventId` or cursor, and refetch whatever was missed.

## Component API design

For component questions, design props like a public library:

```tsx
type AutocompleteProps<T> = {
  // data
  fetchSuggestions: (query: string, signal: AbortSignal) => Promise<T[]>;
  getItemKey: (item: T) => string;
  // rendering
  renderItem?: (item: T, state: { active: boolean }) => React.ReactNode;
  renderEmpty?: (query: string) => React.ReactNode;
  // behavior
  debounceMs?: number;          // default 200
  minQueryLength?: number;      // default 1
  // controlled or uncontrolled value
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect: (item: T) => void;
  // a11y
  label: string;
};
```

Principles to say out loud:

- **Sensible defaults, escape hatches for power users** (render props or slots).
- **Support both controlled and uncontrolled** usage, following the `value`/`defaultValue` convention.
- **Pass `AbortSignal`** so the component can cancel stale requests.
- **Require accessibility-critical props** (such as `label`) at the type level.
- **Generic types** so consumers keep type safety for their item shape.
- **Composition over configuration** when the option list keeps growing (`<Select.Trigger>`, `<Select.Item>`).

## Caching and HTTP semantics

- `ETag` / `If-None-Match` for cheap revalidation.
- `Cache-Control: public, max-age=31536000, immutable` for hashed static assets.
- `stale-while-revalidate` for semi-dynamic JSON at the edge.
- Personalized responses: `private` and `Vary` on auth.
- Client cache keys must include every input that changes the result (`['feed', userId, filters]`).

## Versioning and evolution

- Additive changes only. Never repurpose a field.
- Version via URL (`/v2`) or header for breaking changes. GraphQL: deprecate fields and track usage.
- Contract tests or schema validation (OpenAPI, Zod at the boundary) to catch drift.
- Generate TypeScript types from the schema. Don't hand-maintain both sides.

## What lead candidates add

- **Ownership:** who owns the BFF? If front end teams own it, they can move fast, but they now carry on-call.
- **Performance budgets on the API:** p95 response time targets, payload size limits for mobile.
- **Consistency across teams:** shared error format, pagination conventions, and an API style guide.
- **Security:** auth via httpOnly cookies vs bearer tokens, CSRF strategy, never trusting client-calculated values (prices, permissions).

## Checklist

- [ ] Chose an API style with a one-line justification
- [ ] Wrote at least one realistic request/response with real fields
- [ ] Picked a pagination type that fits the data
- [ ] Described mutations with optimistic reconciliation and idempotency
- [ ] Defined an error shape and client behavior per status
- [ ] Chose a real-time transport and described events and reconnects (if needed)
- [ ] Designed a typed component API with defaults, controlled/uncontrolled support, and a11y
