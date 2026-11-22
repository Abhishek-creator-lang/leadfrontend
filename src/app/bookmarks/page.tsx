import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';
import { PAGE_TITLES } from '@/constants/navigation';
import BookmarksPage from '@/views/bookmarks/BookmarksPage';

export const metadata: Metadata = { title: PAGE_TITLES.bookmarks, robots: NOINDEX };

export default function Page() {
  return <BookmarksPage />;
}
