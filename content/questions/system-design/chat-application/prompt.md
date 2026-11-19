Design the web client of a **chat application** like Facebook Messenger or WhatsApp Web.

Users see a list of their conversations (one-to-one and groups up to ~250 people), open one, read history, and
send messages that arrive in near real time for the other participants.

Requirements given by the interviewer:

- Send and receive text messages and images; messages appear for the recipient within ~500 ms when both are online.
- Show **sent / delivered / read** status, **typing indicators**, and online presence.
- Conversation history can be very long (years of messages); scroll back through it smoothly.
- Users frequently have the app open in several tabs, and on flaky mobile networks.
- Messages written while offline must be sent when connectivity returns.

Design the client architecture, data model, the protocol with the server, and the techniques that keep it fast,
correct and resilient. End-to-end encryption can be discussed as a stretch topic.
