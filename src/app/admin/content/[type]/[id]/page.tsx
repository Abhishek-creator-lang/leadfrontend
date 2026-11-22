import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { docTitle } from '@/lib/validation/content';
import { requireAdmin } from '@/server/auth/dal';
import { editorExtras, livePathOf, loadEditorEntry, statusOf } from '@/server/content/editorData';
import type { PageProps } from '@/types/next';
import { ContentEditor } from '@/views/admin/content/ContentEditor';
import { CONTENT_TYPE_INFO, typeFromSegment } from '@/views/admin/content/contentTypes';

type Params = { type: string; id: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { type, id } = await params;
  const t = typeFromSegment(type);
  if (!t || !UUID.test(id)) return { title: 'Content' };
  const loaded = await loadEditorEntry(id);
  return { title: loaded ? docTitle(t, loaded.doc) || CONTENT_TYPE_INFO[t].label : 'Not found' };
}

export default async function EditContentPage({ params }: PageProps<Params>) {
  await requireAdmin();
  const { type: segment, id } = await params;
  const type = typeFromSegment(segment);
  if (!type) notFound();
  const loaded = UUID.test(id) ? await loadEditorEntry(id) : null;
  if (!loaded || loaded.entry.type !== type) {
    return <EmptyState title="Not found" description="This item may have been deleted." />;
  }
  const { entry, doc } = loaded;
  return (
    <ContentEditor
      data={{
        type,
        id: entry.id,
        status: statusOf(entry),
        doc,
        livePath: livePathOf(type, entry.key, doc),
        ...(await editorExtras(type)),
      }}
    />
  );
}
