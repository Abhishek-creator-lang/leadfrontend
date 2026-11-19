## TL;DR

Use an **i18n library** (react-intl/FormatJS, i18next with react-i18next, or Lingui) that keeps **translations in message catalogs keyed by id**, exposes them through a **provider + hook/component**, and formats with **ICU MessageFormat** (plurals, select, interpolation). Use the built-in **`Intl` APIs** for dates, numbers, currencies, relative time and lists. Load **only the active locale's messages** (code splitting), **detect the locale** from the URL, user settings or `Accept-Language`, set **`<html lang dir>`**, support **RTL** with logical CSS properties, and render the same locale on server and client to avoid hydration mismatches.

## The building blocks

```jsx
// messages/en.json
{ "cart.items": "{count, plural, =0 {Your cart is empty} one {# item} other {# items}}" }
// messages/fr.json
{ "cart.items": "{count, plural, =0 {Votre panier est vide} one {# article} other {# articles}}" }
```

```jsx
import { IntlProvider, FormattedMessage, useIntl } from 'react-intl';

function App({ locale, messages }) {
  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      <CartSummary count={3} total={4999} />
    </IntlProvider>
  );
}

function CartSummary({ count, total }) {
  const intl = useIntl();
  return (
    <p>
      <FormattedMessage id="cart.items" values={{ count }} />
      {' · '}
      {intl.formatNumber(total / 100, { style: 'currency', currency: 'EUR' })}
    </p>
  );
}
```

## Key practices

- **Never concatenate strings.** `"You have " + n + " items"` can't be translated correctly: word order and plural rules differ (Arabic has six plural forms, Japanese has none). Use full ICU messages.
- **Use `Intl`** (`Intl.DateTimeFormat`, `NumberFormat`, `RelativeTimeFormat`, `PluralRules`, `ListFormat`, `DisplayNames`) rather than hand-rolled formatting or heavy libraries. Format in the user's time zone deliberately.
- **Lazy-load catalogs:** `import(\`./messages/${locale}.json\`)` keeps the bundle small. With Server Components, translate on the server and send only rendered text, so no catalog ships to the client for server-only parts.
- **Locale in the URL** (`/fr/products`) is good for SEO (`hreflang`), shareable links and caching. Persist the user's choice and fall back to `Accept-Language`.
- **RTL:** set `dir="rtl"` and use logical properties (`margin-inline-start`, `inset-inline-end`) so layouts mirror automatically. Flip directional icons.
- **Rich text:** use the library's tag interpolation (`<b>…</b>` in messages mapped to components), not `dangerouslySetInnerHTML`.
- **Extraction and workflow:** extract message ids from source (FormatJS CLI, i18next-parser, Lingui), sync with a TMS (Crowdin, Phrase, Lokalise), and fail CI on missing keys. Provide context and descriptions for translators.
- **Testing:** use pseudo-localization (accented, ~30% longer strings) to catch hard-coded text and truncation.

## Pitfalls

- **Hydration mismatches** when the server formats with one locale or time zone and the client with another. Pass the locale and time zone explicitly to both.
- Translating at module load (`const label = t('x')` outside a component) never updates on a locale change.
- Layouts that break with longer strings (German) or different scripts.
- Forgetting `lang` on `<html>`, which screen readers need for pronunciation.
- Sorting or comparing strings without `Intl.Collator`.

## In an interview, mention…

- Catalogs + ICU MessageFormat + `Intl`, and why concatenation fails.
- Locale detection, routing and lazy-loading catalogs. With RSC, translate on the server.
- RTL with logical properties, and `lang`/`dir` attributes.
- The process: extraction, TMS, CI checks for missing keys, pseudo-localization.
