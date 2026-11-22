import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { LinkButton } from '@/components/links';
import { FORMAT_ORDER } from '@/content/formats';
import { TAXONOMY_KEY } from '@/lib/validation/content';
import { PageHeader } from '@/layout/Page';
import { requireAdmin } from '@/server/auth/dal';
import { getEntryByKey, listEntries, type EntryStatus } from '@/server/repositories/content';
import { firstParam, type PageProps, type SearchParamsProps } from '@/types/next';
import { formatDateTime } from '@/utils/date';
import {
  CONTENT_TYPE_INFO,
  contentEditPath,
  contentListPath,
  contentNewPath,
  typeFromSegment,
} from '@/views/admin/content/contentTypes';
import { ContentListTable } from '@/views/admin/content/ContentListTable';

const PAGE_SIZE = 25;
const STATUSES: EntryStatus[] = ['draft', 'published', 'changed', 'archived'];

export async function generateMetadata({ params }: PageProps<{ type: string }>): Promise<Metadata> {
  const type = typeFromSegment((await params).type);
  return { title: type ? CONTENT_TYPE_INFO[type].label : 'Content' };
}

export default async function ContentListPage({
  params,
  searchParams,
}: PageProps<{ type: string }> & SearchParamsProps) {
  await requireAdmin();
  const type = typeFromSegment((await params).type);
  if (!type) notFound();

  // There is a single tag-list document: go straight to its editor.
  if (type === 'taxonomy') {
    const entry = await getEntryByKey('taxonomy', TAXONOMY_KEY);
    if (entry) redirect(contentEditPath('taxonomy', entry.id));
  }

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() || undefined;
  const status = STATUSES.find((s) => s === firstParam(sp.status));
  const format = type === 'question' ? FORMAT_ORDER.find((f) => f === firstParam(sp.format)) : undefined;
  const page = Math.max(1, Number(firstParam(sp.page)) || 1);
  const { items, total } = await listEntries({ type, search: q, status, format, page, pageSize: PAGE_SIZE });

  const info = CONTENT_TYPE_INFO[type];
  const pageHref = (p: number) => {
    const qs = new URLSearchParams({
      ...(q && { q }),
      ...(status && { status }),
      ...(format && { format }),
      page: String(p),
    });
    return `${contentListPath(type)}?${qs}`;
  };

  return (
    <>
      <PageHeader
        title={info.label}
        subtitle={info.description}
        action={
          info.creatable && (
            <LinkButton href={contentNewPath(type)} variant="contained" startIcon={<AddRoundedIcon />}>
              New {info.singular}
            </LinkButton>
          )
        }
      />
      <ContentListTable
        type={type}
        filters={{ q, status, format }}
        rows={items.map((i) => ({
          id: i.id,
          key: i.key,
          title: i.title,
          status: i.status,
          format: i.format,
          updated: formatDateTime(i.updatedAt),
          updatedBy: i.updatedBy,
        }))}
        total={total}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        pageHrefs={Object.fromEntries(
          Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => [i + 1, pageHref(i + 1)])
        )}
      />
    </>
  );
}
