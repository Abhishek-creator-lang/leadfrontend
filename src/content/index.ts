/**
 * Learner content is stored in the database (see src/server/content/catalog.ts).
 * - Server code: `const { getQuestion, … } = await getContent()` from `@/server/content/catalog`.
 * - Client components: `const { getQuestion, … } = useContent()` from `@/context/ContentContext`.
 */
export { createLookups, EMPTY_CONTENT, type ContentLookups } from './lookups';
