import { APP_NAME } from '@/constants/app';
import { LEGAL } from '@/constants/legal';

const MIT_PERMISSION = `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

/** Public licenses and credits page. The single source for content attribution (LICENSES.md points here). */
export const LICENSES_MD = `
Most of ${APP_NAME}'s content (questions, explanations, solutions, tests, study plans and most guides) was **written for this project** and is © ${LEGAL.operatorName}.

Some content is **adapted from open-source projects** released under the MIT License, which allows reuse with attribution. Every adapted page says so at the bottom and links to its source. Their license notices are reproduced below, as the license requires.

## Adapted content

| Source | License | What we use |
|---|---|---|
| [Front End Interview Handbook](https://github.com/yangshun/front-end-interview-handbook) by Yangshun Tay and contributors | MIT | Some HTML, CSS and JavaScript quiz answers, some guide chapters, and company interview guides (edited and reformatted) |
| [Awesome Front End System Design](https://github.com/greatfrontend/awesome-front-end-system-design) by GreatFrontEnd | MIT | Reading-list links in front end system design questions |

${APP_NAME} is an independent project. It is not affiliated with, sponsored by or endorsed by the authors of these projects or their companies.

### MIT License: Front End Interview Handbook

Copyright (c) 2017-Present Yangshun Tay

${MIT_PERMISSION}

### MIT License: Awesome Front End System Design

Copyright (c) 2023 GreatFrontEnd

${MIT_PERMISSION}

## Software and fonts

${APP_NAME} is built with open-source software, used under its licenses:

| Project | License |
|---|---|
| [Next.js](https://github.com/vercel/next.js), [React](https://github.com/facebook/react) | MIT |
| [MUI (Material UI)](https://github.com/mui/material-ui), [Emotion](https://github.com/emotion-js/emotion) | MIT |
| [Sandpack](https://github.com/codesandbox/sandpack) by CodeSandbox | Apache-2.0 |
| [Redux Toolkit](https://github.com/reduxjs/redux-toolkit), [React Redux](https://github.com/reduxjs/react-redux) | MIT |
| [react-markdown](https://github.com/remarkjs/react-markdown), [remark-gfm](https://github.com/remarkjs/remark-gfm), [rehype-highlight](https://github.com/rehypejs/rehype-highlight) | MIT |
| [highlight.js](https://github.com/highlightjs/highlight.js) | BSD-3-Clause |
| [Mermaid](https://github.com/mermaid-js/mermaid) | MIT |
| [Knex](https://github.com/knex/knex), [node-postgres](https://github.com/brianc/node-postgres), [Zod](https://github.com/colinhacks/zod) | MIT |
| [Nodemailer](https://github.com/nodemailer/nodemailer) | MIT-0 |
| [qrcode.react](https://github.com/zpao/qrcode.react) | ISC |
| [Inter](https://github.com/rsms/inter), [Manrope](https://github.com/sharanda/manrope), [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) fonts | SIL Open Font License 1.1 |

## Report a problem

If you think content here is not properly credited or licensed, see [Copyright & content complaints](/copyright) or email ${LEGAL.contactEmail}.
`;
