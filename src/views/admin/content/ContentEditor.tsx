'use client';

import type {
  CompanyDoc,
  ContentType,
  FocusAreaDoc,
  GuideDoc,
  QuestionDoc,
  StudyPlanDoc,
  TaxonomyDoc,
} from '@/lib/validation/content';
import type { EntryStatus } from '@/server/repositories/content';
import { CompanyForm, TaxonomyForm } from './CompanyTaxonomyForms';
import { EditorShell, type Doc, type EditorFormProps } from './EditorShell';
import { GuideForm } from './GuideForm';
import type { QuestionOption } from './Pickers';
import { QuestionForm } from './QuestionForm';
import { FocusAreaForm, StudyPlanForm } from './StudyPlanForm';

export interface EditorData {
  type: ContentType;
  id?: string;
  status?: EntryStatus;
  doc: Doc;
  livePath?: string;
  /** For plan / focus-area pickers. */
  questions: QuestionOption[];
  /** Managed tag lists for the question editor. */
  topics: string[];
  companies: string[];
}

const titleOf = (type: ContentType, doc: Doc) =>
  type === 'company'
    ? String(doc.name ?? '')
    : type === 'taxonomy'
      ? 'Topics & companies'
      : String(doc.title ?? '');

/** Narrows the generic editor props to a specific document type. */
const as = <D extends Doc>(props: EditorFormProps) => props as unknown as EditorFormProps<D>;

/** Picks the form for the content type and wraps it in the shared editor frame. */
export function ContentEditor({ data }: { data: EditorData }) {
  const { type, id, status, doc, livePath } = data;
  const isNew = !id;
  return (
    <EditorShell
      type={type}
      id={id}
      status={status}
      initialDoc={doc}
      title={titleOf(type, doc)}
      livePath={livePath}
    >
      {(props) => {
        switch (type) {
          case 'question':
            return (
              <QuestionForm
                {...as<QuestionDoc>(props)}
                isNew={isNew}
                topicOptions={data.topics}
                companyOptions={data.companies}
              />
            );
          case 'guide':
            return <GuideForm {...as<GuideDoc>(props)} isNew={isNew} />;
          case 'study_plan':
            return <StudyPlanForm {...as<StudyPlanDoc>(props)} isNew={isNew} questions={data.questions} />;
          case 'focus_area':
            return <FocusAreaForm {...as<FocusAreaDoc>(props)} isNew={isNew} questions={data.questions} />;
          case 'company':
            return <CompanyForm {...as<CompanyDoc>(props)} isNew={isNew} />;
          case 'taxonomy':
            return <TaxonomyForm {...as<TaxonomyDoc>(props)} />;
        }
      }}
    </EditorShell>
  );
}
