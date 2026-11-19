Design a **poll widget**: a small component that shows a question with 2–10 options. A user votes once and then
sees the results as percentages and bars, updating live as others vote.

The widget is used in two ways:

1. Inside your own product (posts in a social feed, a team chat).
2. **Embedded on third-party websites** (news articles, blogs) via a snippet the site owner pastes in.

The interviewer adds:

- A popular poll on a news homepage can get **100,000 votes per minute** at peak.
- Single-choice and multiple-choice polls; polls can have an end time; results can be hidden until voting closes.
- Votes should be one per person as far as reasonably possible, including for logged-out users on embeds.

Discuss the component API, the embed strategy and isolation, the voting flow, live results, abuse prevention,
performance and accessibility.
