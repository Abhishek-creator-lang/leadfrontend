import { ListPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';

export default function Loading() {
  return <ListPageSkeleton maxWidth={CONTENT_MAX_WIDTH.narrow} />;
}
