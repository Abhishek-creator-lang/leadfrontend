## How to structure your answer

Use **STAR-L**, with the Action broken into four steps:

1. **Notice**: the concrete signals, not a vague impression.
2. **Diagnose**: a private conversation to understand the cause.
3. **Plan**: clear, measurable expectations agreed together, with support.
4. **Follow through**: regular check-ins, honest feedback, and involving the manager.

If you are a tech lead rather than a people manager, be clear about the line: you mentor and give feedback, while the manager owns formal performance processes. Show you worked with them.

## Model answer

**Situation.** I was tech lead for a team of six building a scheduling SaaS product. An engineer I'll call Sam had joined about six months earlier as a mid-level front-end engineer. His PRs were taking two to three times longer than similar ones from teammates, they often came back after several review rounds, and he had missed two sprint commitments in a row without flagging risk.

**Task.** I was responsible for the team's delivery and for mentoring. His manager was also my manager, and we agreed I would lead the day-to-day coaching.

**Action.** I started with a private conversation, framed around specifics rather than labels: "Your last three PRs averaged nine days and six review rounds; the team's average is three days and two rounds. I want to understand what's getting in the way." It turned out his previous job used Vue with a very prescriptive structure. Our codebase used React with custom hooks, React Query and a lot of implicit conventions that weren't written down. He was embarrassed to keep asking questions, so he guessed, and reviews then asked for rewrites.

That changed my diagnosis from "slow" to "missing context and afraid to ask". We agreed on a six-week plan with three measurable goals: PRs under 400 lines, a draft PR within two days of starting a ticket, and fewer than three review rounds on average. On my side I committed to two one-hour pairing sessions a week, and I wrote the conventions document he was missing, which helped the whole team.

I also changed how work was given to him: smaller, well-scoped tickets first, then gradually larger ones. Every Friday we had a 15-minute check-in looking at the numbers together. I gave direct feedback when things slipped, such as the week he sat on a blocked ticket for three days, and I kept his manager updated with short written notes.

**Result.** By week six, his average PR cycle time was down to four days and review rounds to about two. Two months later he owned the calendar export feature end to end and shipped it on time. The conventions document cut onboarding time for the next two hires as well. About a year later he was promoted to senior.

**Learning.** My first instinct was to assume a skill problem. Starting with curiosity, and with data instead of labels, got to the real cause quickly. I also learned that if one person is missing context, the gap usually affects others too, so I fix the system as well as coaching the person.

## Why this answer works

- **Concrete signals**: cycle time and review rounds, not "he seemed slow".
- **Diagnosis first**: the real cause was missing context and psychological safety, not ability.
- **Clear, measurable plan** with a timeline and support from both sides.
- **Direct feedback** when things slipped, so it was not just kindness.
- **Proper role boundaries**: the manager stayed informed with written notes.
- **System fix**: a conventions document that helped everyone.

## Red flags to avoid

- Talking about the person with contempt or labels ("he just wasn't smart enough").
- Only being nice: no clear expectations or timelines.
- Only being tough: jumping straight to a performance plan without understanding the cause.
- Acting outside your role, such as starting a formal process without the manager.
- Sharing private details about the person's health or personal life.

## Likely follow-up probes

- **"What if he hadn't improved?"** Explain you would have worked with his manager on a formal plan or a better-fitting role, with documented expectations, and that sometimes parting ways is the kind outcome.
- **"How did the team feel about the extra time you spent?"** Balance your time, and point to the conventions document as shared value.
- **"How do you tell the difference between a skill problem and a motivation problem?"** Look at behaviour when given clear goals and support. Motivation issues often have a cause worth asking about.
- **"How do you give feedback without demoralising someone?"** Specific, timely, about behaviour and impact, and paired with a path forward.
- **"Have you ever had a turnaround that failed?"** Have a short, honest example ready.
