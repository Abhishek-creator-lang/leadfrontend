Your company's main web product is a large single-page app (a B2B operations suite: dashboards, billing, inventory,
user admin, reporting). **About 15 teams** commit to one front-end repository and one deploy pipeline. Releases happen
twice a week, a single broken test blocks everyone, and the build takes 25 minutes.

The CTO wants teams to **ship independently**. Design a **micro-frontend platform**: how the product is split, how
pieces are composed at runtime, how they share dependencies, routing, auth and design, how they are deployed and
rolled back, and how the platform is governed.

The interviewer may add:

- Two acquired products (one Vue, one Angular) must appear inside the same shell within a year.
- The app is behind login; SEO is irrelevant, but first load on a mid-range laptop over corporate VPN matters.
- Some customers require that a specific release be pinned for audit reasons.
- Be prepared to argue whether micro-frontends are the right answer at all.
