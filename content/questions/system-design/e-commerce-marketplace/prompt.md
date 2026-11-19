Design the front end of an **e-commerce marketplace** like Amazon.

Cover these user journeys:

1. **Search / category listing**: keyword search with filters (price, brand, rating, Prime-style delivery) and
   sorting; results as a grid.
2. **Product detail page (PDP)**: images, title, price, variants (size/colour), availability, delivery estimate,
   reviews, "frequently bought together".
3. **Cart**: add/remove/update quantity, works for guests and logged-in users.
4. **Checkout**: address, delivery option, payment, review and place order.

Constraints:

- Very high traffic, global audience, many locales and currencies.
- Organic search traffic is a major revenue source, so listing and product pages must be SEO-friendly.
- Every 100 ms of latency measurably affects conversion; target good Core Web Vitals.
- Prices and stock change frequently; the price at checkout must be correct.

Focus on rendering strategy, data/caching, API design, cart/checkout state, and performance, a11y and security.
