Design the front end of a **collaborative document editor** like Google Docs.

Several people open the same document in their browsers and edit it at the same time. Everyone sees the others'
changes within a fraction of a second, along with their cursors and selections. The document supports rich text
(headings, bold/italic, lists, links, images, tables) and comments anchored to ranges of text.

The interviewer adds:

- Documents can be long (100+ pages) and have up to ~50 simultaneous editors; hundreds more may be viewing.
- People edit on flaky connections (trains, conferences) and expect their work to survive going offline briefly.
- Users need version history ("see what changed since yesterday" and "restore this version").
- Permissions: owner, editor, commenter, viewer.

Focus on the client: the editor model, how concurrent edits are merged, the sync protocol, presence, offline
behaviour, and how you keep typing fast in a huge document. Treat the storage backend as something you can shape
the API of, not something you must build.
