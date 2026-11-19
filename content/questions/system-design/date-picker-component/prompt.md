Design a reusable **date picker component** for a design system. It is used for a birth date field in a sign-up
form, a check-in/check-out **date range** on a travel booking site, and filters on analytics dashboards ("last 30
days", custom range).

Requirements:

- A text field where users can type a date, plus a calendar popup to pick one.
- Single date and date range modes; min/max dates; disabled dates (e.g. sold-out nights); optionally showing a price
  or availability per day.
- Works across locales (date formats, first day of week, non-Gregorian calendars as a stretch) and time zones.
- Fully keyboard and screen reader accessible; good on mobile.

Discuss the component API, the date model (and time zone pitfalls), calendar rendering, keyboard interaction and
focus management, positioning, and when you'd use the native `<input type="date">` instead.
