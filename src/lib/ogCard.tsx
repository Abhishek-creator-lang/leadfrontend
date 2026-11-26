import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/constants/app';

/** Share-image size used by every `opengraph-image.tsx` route. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBDB9D"/><stop offset="1" stop-color="#EEB444"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><path d="M11.5 13.5V24H21.5" fill="none" stroke="#121416" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 12.2C10.9 7.4 14.4 4.6 21.6 4.9C21.7 10.6 17.6 13.2 11.5 12.2Z" fill="#248F77"/><path d="M12.2 11.5C14.4 9.4 16.9 7.8 19.8 6.4" fill="none" stroke="#FDF1DD" stroke-width=".85" stroke-linecap="round"/></svg>`;
const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`;

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#248F77',
  medium: '#B7791F',
  hard: '#C53030',
};

export type OgCardProps = {
  /** Small label above the title, e.g. "JavaScript Functions" or "Company guide". */
  eyebrow?: string;
  title: string;
  /** Line under the title, e.g. topics or a subtitle. */
  subtitle?: string;
  /** Short pills at the bottom, e.g. "Medium", "30 min", "Google". */
  tags?: string[];
};

/** Longer titles get a smaller font so they fit in three lines. */
const titleSize = (t: string) => (t.length > 90 ? 48 : t.length > 55 ? 58 : 68);

/** Branded 1200×630 share card shared by the root and per-page Open Graph images. */
export function ogCard({ eyebrow, title, subtitle, tags = [] }: OgCardProps) {
  const clipped = title.length > 140 ? `${title.slice(0, 137)}…` : title;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 80px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FCE8C5 100%)',
        color: '#121416',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_SRC} width={72} height={72} alt="" />
        <div style={{ fontSize: 36, fontWeight: 700 }}>{APP_NAME}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#248F77',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            fontSize: titleSize(clipped),
            fontWeight: 700,
            lineHeight: 1.15,
            marginTop: eyebrow ? 16 : 0,
            maxWidth: 1040,
          }}
        >
          {clipped}
        </div>
        {subtitle && (
          <div style={{ fontSize: 28, color: '#5F636D', marginTop: 20, maxWidth: 1040 }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 14, minHeight: 48 }}>
        {tags.slice(0, 5).map((tag) => (
          <div
            key={tag}
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: 999,
              background: '#FFFFFF',
              border: '2px solid #EEB444',
              color: DIFFICULTY_COLOR[tag.toLowerCase()] ?? '#121416',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    OG_SIZE
  );
}
