/** Props Next.js passes to a dynamic route's `page.tsx` / `generateMetadata` (params are async in Next 15). */
export type PageProps<P extends Record<string, string>> = { params: Promise<P> };
