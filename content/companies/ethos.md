---
title: Ethos Front End Interview Questions
name: Ethos
source: mit-handbook
sourceUrl: https://github.com/yangshun/front-end-interview-handbook/blob/main/website/contents/companies/ethos-front-end-interview-questions.md
---
At Ethos, the life-insurance company, one senior full-stack interview combined frontend debugging with backend coding and system design. The React task used an existing board application, making code reading and state tracing useful preparation alongside writing components from scratch.

## User interface coding questions

- Debug a Trello/Jira-style React board with lane categorization, filtering, sorting, and routing.
- Explain how the underlying records become the displayed cards, and check that changing a view does not corrupt shared data.

Local filtering and record editing can be rehearsed with [Users Database](https://www.greatfrontend.com/questions/user-interface/users-database). Its base exercise covers CRUD and selection; lane grouping, sorting, and URL-based views are separate extensions. For the data transformations, [Data Selection](https://www.greatfrontend.com/questions/javascript/data-selection) provides a smaller exercise in filtering and optional merging.

## Algorithm questions

- Given medication records with start and end dates, find the maximum number of overlapping intervals on a day.

The same overlap-counting idea appears in [Minimum Meeting Rooms Needed](https://www.greatfrontend.com/questions/algo/intervals-minimum-meeting-rooms). Check the endpoint rules: a room can be reused when a meeting ends, whereas a date-range task may include the end date. Touching intervals can therefore produce different answers.

## System design questions

- Design a stock-trading platform across the browser and backend, discussing latency, consistency, durability, and failover.
- Explain how the interface represents an operation that is pending, confirmed, or interrupted.

A reusable orders table is a related component-design exercise. The [Data Table](https://www.greatfrontend.com/questions/system-design/data-table) question covers configurable columns, custom cells, scrolling, and performance; live prices and trading behavior would be additions.

## Insider tips from the GreatFrontEnd community

These tips were shared by [GreatFrontEnd](https://www.greatfrontend.com/) users who have completed interviews with Ethos.

**September 2026**:

> Ethos.com Fullstack Senior loop: BE Machine coding: Given an array of \{drug, startDate, endDate\} for a patient. Find the max no of drugs the patient ingested in a day. (Meeting Scheduler II), FE Machine coding: This was a prefilled react project with bugs. (Trello/Jira board). Had to implement lane categorisation, filterin, sorting, routing. System design: Design a stock trading platform (BE and FE both) db choice, latency guarantees, consistency data durability and fail over handling are important. HM: previous experiences, deep dive into a hero project (especially targeting resilience and fail over handlimg), ops improvements in the team.
