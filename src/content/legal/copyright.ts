import { APP_NAME } from '@/constants/app';
import { LEGAL } from '@/constants/legal';

const L = LEGAL;

export const COPYRIGHT_MD = `
We respect the work of other authors and expect our users to do the same. Content on ${APP_NAME} is either written for this project or adapted from openly licensed projects with credit (see [Licenses & credits](/licenses)). If you believe something here uses your work without permission, or is wrong about you or your organization, tell us and we will act quickly.

## How to send a complaint

Email **${L.contactEmail}** with the subject "Copyright complaint" (or "Content complaint") and include:

1. your name, organization (if any), postal address and email address;
2. a description of the work you believe is infringed, with a link or copy if possible;
3. the exact URL(s) of the material on ${APP_NAME} you want reviewed;
4. a statement that you believe in good faith that the use isn't authorized by you, your agent or the law;
5. a statement that the information in your notice is accurate and that you own the rights or are authorized to act for the owner;
6. your physical or electronic signature.

## What happens next

- We acknowledge your notice within **72 hours**.
- If the complaint is clear and complete, we **remove or disable access** to the material, usually within 72 hours of acknowledgment, while we review it.
- We may contact you for more information, and we will tell you what we did.
- We may rewrite, attribute or permanently remove the material.

## Counter-notice

If your content was removed and you believe that was a mistake, email us with the URL, the reasons and your contact details. We may restore the material if the complaint was mistaken or withdrawn, or if the law allows it.

## Misuse

Please send only genuine complaints. Knowingly false notices may make the sender liable under applicable law.

## Other content concerns

For factual errors, outdated interview information or anything else, use the "Report an issue" link on the page or email ${L.contactEmail}.
`;
