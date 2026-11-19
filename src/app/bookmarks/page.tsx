import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import BookmarksPage from '@/views/bookmarks/BookmarksPage';

export const metadata: Metadata = { title: PAGE_TITLES.bookmarks };

export default function Page() {
  return <BookmarksPage />;
}
