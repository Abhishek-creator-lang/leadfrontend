import { APP_NAME } from '@/constants/app';
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/ogCard';

export const alt = `${APP_NAME}: frontend interview questions and prep for senior engineers`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Default share image (Open Graph / Twitter) for every page without its own. */
export default function OpenGraphImage() {
  return ogCard({
    title: 'Frontend interview questions & prep for senior engineers',
    subtitle: 'JavaScript · React UI coding · Algorithms · System design · Behavioral',
  });
}
