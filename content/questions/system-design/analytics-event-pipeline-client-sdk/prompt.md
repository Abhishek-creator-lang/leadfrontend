Your company's product decisions depend on analytics, but nobody trusts the numbers. Each of **20 teams** calls a
different mix of Google Analytics, Segment, Amplitude and a home-grown endpoint. Event names are inconsistent
(`AddToCart`, `add_to_cart`, `cart-add`), properties change without notice, and an audit found email addresses in
event properties.

Design an **analytics event pipeline and client SDK** used by all web apps (and, later, mobile):

- How events are defined, reviewed and versioned (a tracking plan).
- The client SDK: API, identity, batching, offline and reliable delivery, performance impact.
- Consent and privacy (GDPR/CCPA), PII protection and data residency.
- The collection endpoint and pipeline into the warehouse and downstream tools.
- How you validate data quality and prevent bad events from reaching dashboards.
- How you migrate 20 teams and measure whether the data is now trustworthy.

Expected volume: **15 million daily active users**, around **2 billion events per day**.
