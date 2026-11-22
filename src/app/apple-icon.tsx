import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Full-bleed version of the brand mark (iOS rounds the corners itself). Artwork: public/favicon.svg. */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBDB9D"/><stop offset="1" stop-color="#EEB444"/></linearGradient></defs><rect width="32" height="32" fill="url(#g)"/><path d="M11.5 13.5V24H21.5" fill="none" stroke="#121416" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 12.2C10.9 7.4 14.4 4.6 21.6 4.9C21.7 10.6 17.6 13.2 11.5 12.2Z" fill="#248F77"/><path d="M12.2 11.5C14.4 9.4 16.9 7.8 19.8 6.4" fill="none" stroke="#FDF1DD" stroke-width=".85" stroke-linecap="round"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`}
      width={180}
      height={180}
      alt=""
    />,
    size
  );
}
