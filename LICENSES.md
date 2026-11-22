# Content sources and licenses

> The public version of this page is `/licenses` (source: `src/content/legal/licenses.ts`), which also
> reproduces the license notices as MIT requires. Update both when sources change. Run
> `npm run audit:content` to list titles and names to reword.

Most of the content in `content/` was written for this project. Third-party material appears only where its
license allows it, and every imported page carries a `source` field. The app shows an attribution line on those
pages.

| Source | License | What we use | `source.type` |
|---|---|---|---|
| [Front End Interview Handbook](https://github.com/yangshun/front-end-interview-handbook) by Yangshun Tay and contributors | MIT | HTML/CSS/JS quiz answers, some playbook chapters, company guides (imported by `scripts/import-handbook.ts`, with Docusaurus syntax and referral parameters removed) | `mit-handbook` |
| [Awesome Front End System Design](https://github.com/greatfrontend/awesome-front-end-system-design) by GreatFrontEnd | MIT | Reading-list links in system-design questions | `mit-awesome-fesd` |

We used the question **titles** in `content-plan/quiz-*-titles.txt`, taken from GreatFrontEnd's public "top interview
questions" repositories, only as a coverage checklist. Those repositories have no license, so none of their
answer text is reproduced. Every answer was written independently.

No content from GreatFrontEnd's website (free or paid questions, solutions, tests or guides) is copied into this
project.

---

## MIT License: Front End Interview Handbook

Copyright (c) 2017-Present Yangshun Tay

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
