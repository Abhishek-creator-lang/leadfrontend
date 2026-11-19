Design a **real-time collaborative whiteboard** product in the spirit of Miro or FigJam. Users create boards with
sticky notes, shapes, connectors, free-hand drawing, text, images and frames, and collaborate live.

Scale and constraints the interviewer gives:

- **5 million** monthly active users; typical boards have 2–10 concurrent editors, but workshops and all-hands
  sessions reach **300 concurrent participants** on one board (most of them viewing, some editing).
- Large boards contain **50,000+ objects** and must stay smooth (60 fps panning and zooming) on a mid-range laptop.
- Users see each other's cursors, selections and edits in real time; edits made offline (on a train) must merge
  when they reconnect.
- Boards have permissions (owner, editor, commenter, viewer) and enterprise customers need audit and data residency.
- Several teams will build on this: a templates team, an integrations team (embedding Jira cards), and an AI team.

As the lead, cover the client architecture, rendering, the data model and sync protocol, the multiplayer service, and
how the platform is structured so multiple teams can extend it safely.
