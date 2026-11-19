Your organisation runs **25 web applications** (React SPAs, a Next.js storefront and a few legacy server-rendered
pages) built by **35 teams**, with roughly **8 million page views per day**. Today each team does something different:
some use Sentry, some log to the console in production, one has a home-grown beacon. When something breaks, nobody can
tell whether a slow checkout is the browser, the CDN or a back-end service.

Design a **front-end observability platform** that gives every team:

- Error tracking with readable stack traces.
- Real user monitoring (Core Web Vitals and custom timings).
- End-to-end tracing from a user interaction to back-end services.
- Alerting and dashboards per app and per team.

Discuss the client SDK, the ingestion pipeline, sampling and cost control, privacy, and whether to build on
OpenTelemetry or buy Sentry, Datadog RUM or similar. Explain how you would roll it out across teams and measure success.
