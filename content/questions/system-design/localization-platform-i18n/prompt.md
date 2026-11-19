Your company is expanding from **3 languages to 25 locales** over the next year, including **Arabic and Hebrew** (right
to left), **Japanese**, **German** (long strings), and several locales with complex plural rules (Polish, Russian,
Arabic). There are **18 web apps** owned by **25 teams**, plus iOS and Android apps, transactional emails and a
marketing CMS.

Today strings are a mix of hard-coded English, a few JSON files per app, and string concatenation such as
`"You have " + n + " items"`. Translations are emailed to an agency as spreadsheets.

Design a **localization platform**: how developers author messages, how strings are extracted and sent for
translation, how translations are reviewed and delivered to apps (including without redeploying), the runtime SDK,
formatting of dates/numbers/currencies, RTL support, quality checks in CI, and how you would roll it out across teams.
