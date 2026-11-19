You have joined a company with roughly **40 product teams** and **25 customer-facing web apps**. Over the years each
team has built its own buttons, modals and colour palettes. Most apps are React, two are Angular, and a marketing
site is server-rendered with plain HTML. The company also sells a white-label version of its product, so at least
**three brands** (plus light and dark modes) must be supported.

Leadership asks you to **design the design-system platform**: how tokens and components are authored, built,
distributed, documented, tested, versioned and adopted, and how the system is governed over time.

Things the interviewer may add along the way:

- Designers work in Figma and want design and code to stay in sync.
- Accessibility (WCAG 2.2 AA) is a legal requirement in several markets.
- Some teams ship daily; others are on quarterly release trains and cannot upgrade often.
- The design-system team is 6 engineers and 3 designers. You cannot build everything for everyone.

Walk through requirements, architecture, the token and component contracts, the consumer-facing interfaces
(packages, CLI, CI checks), and the trade-offs you would make, including how you would drive adoption and measure
success.
