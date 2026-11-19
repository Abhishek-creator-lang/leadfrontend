Design the web client of a **video streaming service** like Netflix.

Users sign in, pick a profile, and land on a **browse page** made of many horizontal rows ("Continue watching",
"Trending now", genres). Hovering or focusing a title shows a preview. Selecting a title opens a details view, and
"Play" starts a full-screen **video player**.

Requirements from the interviewer:

- Playback must start quickly (target < 2 s) and adapt to the user's bandwidth without stalling.
- Content is protected (DRM) and licensed per region.
- Subtitles and multiple audio tracks in many languages.
- "Continue watching" resumes where the user stopped, on any device.
- The same web app also runs on smart TVs (keyboard/remote navigation only).

Cover the browse experience, the player architecture, data/API design, and performance, accessibility and
reliability concerns.
