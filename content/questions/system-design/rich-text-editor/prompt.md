Design a reusable **rich text editor component** for a design system, of the kind used for comments, issue
descriptions, chat composers and CMS articles.

It supports paragraphs, headings, bold/italic/underline/strikethrough, inline code, links, bulleted and numbered
lists, block quotes, code blocks, images and @mentions. It has a toolbar and keyboard shortcuts, Markdown-style
shortcuts (typing `## ` creates a heading), and paste from Word, Google Docs and web pages.

The interviewer adds:

- Multiple product teams will use it, each enabling a different subset of features and adding custom nodes
  (e.g. a "task" embed).
- Content is stored on the server and rendered elsewhere (emails, mobile apps), so the stored format matters.
- It must work with IMEs (Chinese, Japanese, Korean), on mobile browsers, and with screen readers.

Discuss the editing model, the document format, the component and plugin API, and the hard edge cases. Real-time
collaboration is a follow-up, not the main focus.
