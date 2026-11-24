import { APP_NAME } from '@/constants/app';
import { LEGAL } from '@/constants/legal';

const L = LEGAL;

export const TERMS_MD = `
These Terms of Use ("**Terms**") govern your use of ${APP_NAME} (the "**Site**"), run by an individual based in ${L.country} ("**we**", "**us**"). By using the Site or creating an account you agree to these Terms and to our [Privacy Policy](/privacy). If you do not agree, do not use the Site.

## 1. Who can use the Site

You must be at least 18 years old, or use the Site with the consent and supervision of a parent or legal guardian who accepts these Terms on your behalf.

## 2. What the Site is

${APP_NAME} is a **free educational resource** for preparing for front end engineering interviews: questions, explanations, sample solutions, guides, study plans and an in-browser code editor.

## 3. Educational content, no guarantees

- All content is provided for **general educational purposes only**. It is not professional, career, legal or hiring advice.
- Content may be **incomplete, out of date or contain errors**, including in explanations, solutions, code, tests and descriptions of companies' interview processes. Interview reports are historical and anecdotal and may not reflect any company's current process.
- We do **not** guarantee any result, including passing an interview, receiving an offer or getting a job.
- You use the content and any code at your own risk. Check important information against official documentation before relying on it.

If you find a mistake, please tell us at ${L.contactEmail} or with the "Report an issue" link on the page.

## 4. Accounts

An account is optional and only saves your progress, notes and bookmarks. Keep your password confidential and tell us promptly about any unauthorized use. You are responsible for activity under your account. We may suspend or close accounts that break these Terms. You may ask us to delete your account at any time (see the [Privacy Policy](/privacy)).

## 5. Acceptable use

You agree not to:

- copy, scrape, crawl, download in bulk, republish, sell or commercially redistribute the Site's content, except as allowed by section 6 or by the license of specific open-source content;
- use automated tools that put excessive load on the Site, or try to break, probe or bypass its security;
- upload or run malicious code in the editor, or use the Site for anything unlawful;
- impersonate others or misrepresent your affiliation with anyone.

## 6. Intellectual property

- **Our content.** Original content on the Site (text, questions, solutions, tests, code and design) is © ${L.operatorName}. We grant you a personal, non-exclusive, non-transferable, revocable license to view and use it for your own interview preparation.
- **Open-source content.** Some content is adapted from projects released under the MIT License. It is marked on the page and remains under its original license; see [Licenses & credits](/licenses). Nothing in these Terms limits your rights under those licenses.
- **Your content.** Notes you write stay yours. You give us only the permission needed to store and show them to you.
- **Trademarks.** Company and product names, logos and trademarks mentioned on the Site belong to their owners. Their use is only to identify them. **We are not affiliated with, sponsored by or endorsed by any company, product or website named on the Site**, including any other interview-preparation service.

## 7. Third-party links

The Site links to third-party websites. We do not control them and are not responsible for their content, availability or practices. A link is not an endorsement.

## 8. Voluntary contributions

The Site may let you send a voluntary contribution ("Buy me a coffee"), for example by UPI. Contributions are **gifts to support a free project**. They do not buy any product, service, access or priority, and they are **non-refundable** except where the law requires otherwise. No goods or services are supplied in return.

## 9. Copyright complaints

We respect intellectual property rights. If you believe material on the Site infringes your rights, follow our [Copyright & content complaints](/copyright) process. We will review the notice and, where appropriate, remove or disable the material promptly.

## 10. Disclaimer of warranties

To the fullest extent permitted by law, the Site and all content are provided **"as is" and "as available"**, without warranties of any kind, express or implied, including accuracy, completeness, fitness for a particular purpose, non-infringement and uninterrupted or error-free operation.

## 11. Limitation of liability

To the fullest extent permitted by law:

- we are not liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, opportunities, employment, data or goodwill, arising from or related to your use of the Site or its content;
- our **total liability** for all claims relating to the Site is limited to the greater of **INR 1,000** or the total contributions you made to us in the 12 months before the claim.

Nothing in these Terms excludes liability that cannot be excluded under applicable law.

## 12. Indemnity

You agree to indemnify and hold us harmless from claims, losses and expenses (including reasonable legal fees) arising from your breach of these Terms or your misuse of the Site.

## 13. Changes and termination

We may change, suspend or discontinue the Site or any content at any time. We may update these Terms; the "Last updated" date shows the latest version. Continuing to use the Site after a change means you accept the updated Terms.

## 14. Governing law and disputes

These Terms are governed by the laws of **${L.country}**. Before starting any proceedings, you agree to contact us at ${L.contactEmail} and give us 30 days to try to resolve the matter informally.

## 15. General

If any part of these Terms is found unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. These Terms, with the Privacy Policy, are the entire agreement between you and us about the Site.

## 16. Contact

${L.operatorName}, ${L.contactEmail}
`;
