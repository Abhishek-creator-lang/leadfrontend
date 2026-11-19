Design the web front end of an **email client** like Outlook on the web or Gmail.

The core experience:

- A three-pane layout: **folders/labels**, a **message list** (inbox), and a **reading pane**.
- Messages grouped into **conversations (threads)**; mark read/unread, flag, archive, delete, move, with bulk
  selection.
- Reading a message: HTML emails from arbitrary senders, attachments, inline images.
- **Composing**: reply, reply-all, forward, new message with rich text, recipients autocomplete, attachments,
  auto-saved drafts.
- Search across the mailbox.

Constraints:

- Power users have **hundreds of thousands of messages** and keep the app open all day.
- New mail should appear without a refresh.
- Must be keyboard-friendly and usable offline for recent mail.
- Email content is untrusted input from the whole internet.

Focus on the client: architecture, data model and sync, API, rendering of untrusted HTML, and performance,
accessibility and offline.
