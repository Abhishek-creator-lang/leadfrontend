## How to structure your answer

There is no STAR story here. Instead, prepare a **question bank** grouped by interviewer, pick two or three, and use a simple pattern:

1. **Hook**: refer to something said earlier ("You mentioned the three squads share the component library...").
2. **Question**: one open question, not three stacked together.
3. **Follow-through**: listen, ask one follow-up, and if possible connect it briefly to your experience.

Tailor the questions to who is in the room:

- **Hiring manager**: success criteria, team challenges, how they support leads.
- **Peer engineers**: day-to-day reality, code review, on-call, how decisions are made.
- **Product or design partner**: how engineering and product shape the roadmap together.
- **Senior leader (director, VP)**: strategy, where front end fits in the company, how investment decisions are made.

## Model answer

*Context: final round with the hiring manager for a front-end lead role. Earlier, they mentioned the web app was being split into separately deployed areas.*

"Thanks, I do have a few.

First, you mentioned the team is splitting the web app into separately deployed areas. If I joined, what would a successful first six months look like from your point of view? And what would make you think, three months in, that the hire was not working out?

*(The manager says success means the three squads agree on shared conventions for routing, data fetching and the design system, and that release confidence improves. They are worried about a lead who designs alone and imposes decisions.)*

That is helpful. In my last role I hit the same risk when we moved to a monorepo with Nx: I learned that writing the conventions together with one engineer from each squad took two weeks longer but meant they were actually followed. So it is good to hear that collaboration is weighted that heavily.

Second, how are technical decisions that cross teams made today? Is there an RFC process, an architecture group, or is it mostly through leads talking to each other?

*(The manager says it is informal and that has caused some duplicated work.)*

Last question: what is the biggest front-end problem you have not had time to solve, the one you hope this person will take on?

*(The manager mentions flaky end-to-end tests blocking releases about once a week.)*

That is one I would enjoy. Is the flakiness mostly in the tests themselves or in the test environments? I can share what we did to reduce our Playwright flake rate if useful, but I am mostly curious about where it comes from here."

**A question bank to adapt:**

- *Team and role*: "Which decisions would be mine to make, and which would I influence?" / "How does this role split responsibilities with the engineering manager?"
- *Engineering health*: "How often do you deploy, and what usually stops a release?" / "Which Core Web Vitals or reliability metrics does the team track, and who looks at them?"
- *Collaboration*: "How do product, design and engineering decide what goes into a quarter?" / "When engineering and product disagree, how does it usually get resolved?"
- *Growth*: "What does the path from this role to staff or principal look like here? Can you give an example of someone who made it?"
- *Culture*: "Tell me about a recent incident or failed project. What happened afterwards?"

## Why this answer works

- **Builds on the conversation**: each question refers to something already discussed.
- **Reveals lead priorities**: success criteria, cross-team decision-making, and the biggest unsolved problem.
- **Gets decision-useful information**: the candidate learns about the manager's worry (a lead who designs alone) and can address it.
- **Brief connections to experience** without turning every answer into a pitch.
- **Ends on a concrete problem** the candidate is visibly excited to solve.

## Red flags to avoid

- "No, I think you covered everything."
- Questions answered on the careers page or in the job description.
- Leading with salary, holidays or perks in an early technical round. Those belong with the recruiter.
- Asking engineers deep strategy questions they cannot answer, or a VP about the linting setup.
- Stacking several questions into one, which leaves the interviewer to choose the easiest.
- Using the time for another long story about yourself.
- Questions that sound like criticism, such as "Why is your site so slow?" Rephrase as curiosity: "How do you prioritise performance work against features?"

## Likely follow-up probes

- **"Does that answer your question?"** If not, say what you still want to know, politely. It shows you listen carefully.
- **"What would you do about that problem?"** Give a short, humble answer: what you would want to learn first, and one approach that worked elsewhere. Avoid a full solution with no context.
- **"What is most important to you in your next role?"** Have a clear, honest answer that matches what you said earlier, for example scope across teams and a team that writes things down.
- **Running out of time**: ask your most important question first, and offer to follow up with the recruiter on the rest.
