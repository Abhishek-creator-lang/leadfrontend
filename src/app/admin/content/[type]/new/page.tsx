import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/auth/dal';
import { editorExtras } from '@/server/content/editorData';
import type { PageProps } from '@/types/next';
import { ContentEditor } from '@/views/admin/content/ContentEditor';
import { CONTENT_TYPE_INFO, typeFromSegment } from '@/views/admin/content/contentTypes';
import { EMPTY_DOCS } from '@/views/admin/content/emptyDocs';

export async function generateMetadata({ params }: PageProps<{ type: string }>): Promise<Metadata> {
  const type = typeFromSegment((await params).type);
  return { title: type ? `New ${CONTENT_TYPE_INFO[type].singular}` : 'New' };
}

export default async function NewContentPage({ params }: PageProps<{ type: string }>) {
  await requireAdmin();
  const type = typeFromSegment((await params).type);
  const empty = type && EMPTY_DOCS[type];
  if (!type || !empty) notFound();
  return <ContentEditor data={{ type, doc: empty, ...(await editorExtras(type)) }} />;
}
