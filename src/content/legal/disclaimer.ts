import { APP_NAME } from '@/constants/app';
import { LEGAL } from '@/constants/legal';

export const DISCLAIMER_MD = `
## Educational content, provided as is

${APP_NAME} is a free educational project. Questions, explanations, solutions, code, tests, guides and study plans are written to help you prepare for interviews. They are **not** professional, career or hiring advice.

We work to keep content correct, but it **may contain errors, omissions or outdated information**, and code may have bugs. Everything is provided **"as is"**, without any warranty, and you use it at your own risk. Check important details against official documentation (for example MDN, the ECMAScript specification or React's documentation).

**No guarantee of results.** Using the Site doesn't guarantee passing an interview, getting an offer or a job.

## Interview reports

Company guides summarize **publicly shared candidate reports and public information**. They are historical and anecdotal, may be outdated or inaccurate, and do **not** describe any company's official or current interview process. Always follow the instructions from your recruiter.

## Trademarks and affiliation

Company names, product names and trademarks (for example Google, Meta, Amazon or React) belong to their owners and are used only to identify them. **${APP_NAME} is not affiliated with, sponsored by or endorsed by any company, product or website mentioned on the Site**, including other interview-preparation services we link to.

## Third-party content and links

Some content is adapted from open-source projects under the MIT License and is credited on the page and on [Licenses & credits](/licenses). External links are provided for convenience; we don't control those sites and aren't responsible for them.

## Found a mistake?

Use the "Report an issue" link on any page, or email ${LEGAL.contactEmail}. We fix reported errors as quickly as we can.
`;
