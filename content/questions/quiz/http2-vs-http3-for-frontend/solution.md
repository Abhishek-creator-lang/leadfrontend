## TL;DR

**HTTP/1.1** handles one request at a time per TCP connection, so browsers opened ~6 connections per host and developers bundled, sprited and sharded domains. **HTTP/2** multiplexes many streams over **one** TCP connection with binary framing and header compression (HPACK), which removes application-level head-of-line blocking. But a single lost TCP packet still stalls *every* stream. **HTTP/3** runs over **QUIC** (on UDP), with streams that are independent at the transport level, TLS 1.3 built in, faster handshakes and **connection migration** across networks. The biggest gains show up on lossy, high-latency mobile networks.

## Side by side

| | HTTP/1.1 | HTTP/2 (RFC 9113) | HTTP/3 (RFC 9114) |
|---|---|---|---|
| Transport | TCP | TCP | QUIC over UDP (RFC 9000) |
| Concurrency | ~6 connections per host, one request each at a time | Many streams on one connection | Many streams, independent at the transport layer |
| Head-of-line blocking | Per connection | Solved at HTTP layer, still at TCP layer | Only within a stream |
| Header compression | None | HPACK | QPACK |
| Handshake (new connection) | TCP 1 RTT + TLS 1–2 RTT | Same | 1 RTT combined; 0-RTT on resumption |
| Network change (Wi-Fi → 4G) | Reconnect | Reconnect | Connection IDs allow migration |
| Encryption | Optional | Effectively required by browsers | Always (TLS 1.3 built in) |

**Discovery:** browsers learn that a server speaks HTTP/3 via the `Alt-Svc` response header or DNS `HTTPS` records, so the first visit may use HTTP/2 and later requests switch over. Some networks block or throttle UDP, and browsers fall back to HTTP/2 transparently.

**Server Push** (HTTP/2) is effectively dead: Chrome removed it in 2022 and HTTP/3 support in browsers never really used it. Use **103 Early Hints** and `preload` instead.

## What changes for front-end engineers

**Stop doing (HTTP/1.1-era hacks)**
- **Domain sharding**: it breaks multiplexing and prioritisation and adds DNS and TLS handshakes. (HTTP/2 can *coalesce* connections across hostnames on the same certificate and IP, which partially mitigates old setups.)
- **Extreme concatenation and sprites**: one giant bundle means any change invalidates the whole cache entry.
- **Inlining everything as data URIs**: they can't be cached separately.

**Still do**
- Bundle sensibly. Requests aren't free (per-request overhead, compression works better on larger files, and module depth causes discovery waterfalls). Aim for moderately granular chunks.
- Reduce the number of **origins** on the critical path; each one is still a new handshake.
- **Prioritise**: HTTP/2's original priority tree was widely mis-implemented. RFC 9218's simpler **Extensible Priorities** scheme (the `Priority` header) is used with HTTP/3 and HTTP/2. In practice you influence priority with `fetchpriority`, `preload` and resource ordering.
- Compress (Brotli, increasingly Zstandard) and cache.

## Operational notes

- Turning on HTTP/3 is usually a CDN toggle. Measure TTFB and LCP for mobile users in high-latency regions before and after; desktop on fibre may show little difference.
- Load balancers and firewalls must allow UDP 443. Observability tools built around TCP may need updates.
- 0-RTT data can be replayed, so servers should only accept it for idempotent requests.

## Pitfalls

- Claiming HTTP/2 "removed head-of-line blocking" without the TCP caveat.
- Suggesting Server Push in 2025.
- Expecting HTTP/3 to fix a slow backend. It cuts network latency, not server think-time.

## In an interview, mention…

- Multiplexing → TCP head-of-line blocking → QUIC as the progression.
- Handshake RTT savings and connection migration for mobile users.
- Which HTTP/1.1 optimisations are now anti-patterns and which still matter.
- That you'd validate the impact with RUM split by protocol (`nextHopProtocol` in Resource Timing).
