---
title: Meta Front End Interview Questions
name: Meta
source: mit-handbook
sourceUrl: https://github.com/yangshun/front-end-interview-handbook/blob/main/website/contents/companies/meta-front-end-interview-questions.md
---
Meta does not delete leaked questions from its question bank. Working through the top 100–250 Meta-tagged LeetCode questions is a high-leverage prep strategy. Frontend pipeline interviews are FE-focused: candidates have reported being caught off guard by JS-utility-style questions like Event Emitter and `classnames` when expecting pure DSA.

## JavaScript coding questions

- Implement an Event Emitter (Emitter Pattern).
  - [Practice question](https://www.greatfrontend.com/questions/javascript/event-emitter) (Free)
- Implement `classnames` — combine class names from strings, arrays, and conditional objects.
  - [Practice question](https://www.greatfrontend.com/questions/javascript/classnames) (Free)
- Implement a `Decryption` class — focuses on managing async operations and a callback queue. The provided `decryptEncrypt(key, payload, callback)` generates a new key per call; your class must enqueue callbacks and process them in order as decryption completes. (The name is misleading — it's an async-operations question, not a security question.)
- Find the identical DOM node in two identical trees: given a node in one tree, locate the equivalent node in the other tree by reference. Efficient solution: walk up via `parentNode`, record the path, then replay the path in the other tree (avoids touching unrelated nodes vs. DFS/BFS).

## User interface coding questions

- Sticky ads on scroll: implement an ad element that follows the user as they scroll. Throttle is preferred over debounce here because the ad must reposition during the scroll, not after it ends.

## System design questions

- Design a Data Table component (frequent FE system design round).
  - [Read answer](https://www.greatfrontend.com/questions/system-design/data-table) (Paid)
- Design Autocomplete (common Meta system design question).
  - [Read answer](https://www.greatfrontend.com/questions/system-design/autocomplete) (Free)
- Design a News Feed (Facebook-style).
  - [Read answer](https://www.greatfrontend.com/questions/system-design/news-feed-facebook) (Free)
- Use the RADIO framework to approach Meta FE system design rounds.

## Insider tips from the GreatFrontEnd community

These tips were shared by [GreatFrontEnd](https://www.greatfrontend.com/) users who have completed interviews with Meta.

**May 2025**:

> 17.5 mins to solve per question. and there are 2 questions in a 40 mins round. Meta asks variants. 😢

**January 2025**:

> I did meta last year. It was 2 leetcodes for frontend positions.

**January 2025**:

> No, every company has preselected questions in a question bank. Google will delete leaked questions, Meta does not.
>
> If you do the top 100/250 of Meta leetcode questions, you have a really good chance at getting one of the questions during the interview.

**May 2024**:

> Appreciate the response! I interviewed with Meta and was caught off guard with Emitter Pattern & Classnames fn when I expected DSA 😦

**April 2024**:

> Hi, if you are in the front end pipeline, the questions will be focused on front end. For me, I am interviewing for IC 4/5. I have gone through a phone screen and the onsite was 4 rounds: 2 coding, 1 BQ and 1 system design. The coding is similar to the type of js questions on GreatFrontEnd and for system design, I used the RADIO framework to approach it. If you are interviewing for IC6 and above, I think you will need to go through one more design round but one less coding The next step is team matching. It could take a while, so it depends

For more insider tips, visit [GreatFrontEnd](https://www.greatfrontend.com/)!
