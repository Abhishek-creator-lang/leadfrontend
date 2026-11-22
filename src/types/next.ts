/** Props Next.js passes to a dynamic route's `page.tsx` / `generateMetadata` (params are async in Next 15). */
export type PageProps<P extends Record<string, string>> = { params: Promise<P> };

/** Props for a page that reads its query string. */
export type SearchParamsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** First value of a query param (`?a=1&a=2` → `'1'`). */
export const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
