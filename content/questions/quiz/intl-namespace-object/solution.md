## TL;DR

`Intl` is the built-in **ECMAScript Internationalization API**: a namespace of locale-aware formatters and comparers backed by the browser's CLDR data. It handles **numbers and currencies, dates and times, relative times, plurals, lists, collation (sorting), text segmentation and display names** without shipping a library. Create a formatter once, reuse it, and pass the user's locale.

## The main constructors

```js
const locale = navigator.language; // e.g. 'de-DE'

new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1234.5);
// '1.234,50 €'
new Intl.NumberFormat('en', { notation: 'compact' }).format(1_250_000); // '1.3M'
new Intl.NumberFormat('en', { style: 'unit', unit: 'kilometer-per-hour' }).format(88);

new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
  .format(new Date()); // '17 Nov 2026, 14:05'

new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day'); // 'yesterday'

new Intl.PluralRules('en').select(1);                     // 'one'
new Intl.PluralRules('en', { type: 'ordinal' }).select(2); // 'two' → "2nd"

new Intl.ListFormat('en', { type: 'conjunction' }).format(['a', 'b', 'c']); // 'a, b, and c'

['ä', 'z', 'a'].sort(new Intl.Collator('de').compare); // ['a', 'ä', 'z']

new Intl.DisplayNames(['en'], { type: 'region' }).of('IN'); // 'India'

const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
[...seg.segment('👩‍👩‍👧é')].length; // 2 user-perceived characters
```

Shortcuts like `number.toLocaleString(locale, opts)`, `date.toLocaleDateString()` and `str.localeCompare()` use the same machinery, but create a new formatter per call. That's slow in hot loops, so cache an `Intl` instance instead.

## Why it matters

- **Correctness**: decimal separators, digit grouping (Indian lakh/crore grouping in `en-IN`), currency placement, 12/24-hour clocks, calendars and plural categories differ per language. Arabic has six plural forms; string concatenation like `count + ' item' + (count > 1 ? 's' : '')` is wrong for most languages.
- **Bundle size**: replaces much of Moment.js/numeral.js-style formatting. The data ships with the browser.
- **Sorting**: `Collator` handles accents and options such as `numeric: true` (so 'file10' sorts after 'file9') and `sensitivity: 'base'` for case-insensitive comparisons.
- **Segmentation**: `Intl.Segmenter` splits graphemes, words and sentences properly, even for languages without spaces (Japanese, Thai). `str.length` counts UTF-16 code units, not characters.

## Pitfalls

- Output strings can change between browser versions as CLDR data updates. Don't assert exact strings in tests or compare formatted output across server and client. SSR hydration mismatches are common when server and client locale or time zone differ, so pass both explicitly.
- Format output may contain non-breaking or narrow no-break spaces (` ` before AM/PM in newer data).
- `Intl` formats; it doesn't translate your UI strings. Use a message-formatting library (ICU MessageFormat via FormatJS, i18next) for that.
- Use `resolvedOptions()` to see which locale/time zone was actually applied, and `Intl.supportedValuesOf('currency')` to list supported values.

## In an interview, mention…

- Reuse formatter instances for performance.
- Plural rules and segmentation as examples where naive code breaks.
- Time zones: `Date` stores UTC instants; `Intl.DateTimeFormat` with `timeZone` renders them. `Temporal` is the modern date/time API arriving in engines.
- SSR consistency: pin locale and time zone.
