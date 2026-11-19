import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FORMAT_INFO, FORMAT_ORDER, isFormat } from '@/content/formats';
import type { PageProps } from '@/types/next';
import QuestionsPage from '@/views/questions/QuestionsPage';

type Params = { format: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return FORMAT_ORDER.map((format) => ({ format }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { format } = await params;
  return { title: isFormat(format) ? FORMAT_INFO[format].label : 'Questions' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { format } = await params;
  if (!isFormat(format)) return notFound();
  return (
    <Suspense>
      <QuestionsPage format={format} />
    </Suspense>
  );
}
