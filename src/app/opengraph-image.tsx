import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/constants/app';

export const alt = `${APP_NAME}: front end interview questions and prep for senior engineers`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBDB9D"/><stop offset="1" stop-color="#EEB444"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><path d="M11.5 13.5V24H21.5" fill="none" stroke="#121416" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 12.2C10.9 7.4 14.4 4.6 21.6 4.9C21.7 10.6 17.6 13.2 11.5 12.2Z" fill="#248F77"/><path d="M12.2 11.5C14.4 9.4 16.9 7.8 19.8 6.4" fill="none" stroke="#FDF1DD" stroke-width=".85" stroke-linecap="round"/></svg>`;

/** Default share image (Open Graph / Twitter) for every page without its own. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '72px 88px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FCE8C5 100%)',
        color: '#121416',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`}
          width={96}
          height={96}
          alt=""
        />
        <div style={{ fontSize: 44, fontWeight: 700 }}>{APP_NAME}</div>
      </div>
      <div
        style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15, marginTop: 48, maxWidth: 980 }}
      >
        Front end interview questions & prep for senior engineers
      </div>
      <div style={{ fontSize: 30, color: '#5F636D', marginTop: 28 }}>
        JavaScript · React UI coding · Algorithms · System design · Behavioral
      </div>
    </div>,
    size
  );
}
