Design the **web player for a music streaming service** like Spotify.

Users browse a home page of recommendations, search for artists, albums and tracks, open album and playlist pages,
manage their library, and play music. The player bar at the bottom shows the current track with play/pause, seek,
next/previous, shuffle, repeat, volume and a queue.

The interviewer adds:

- Playback must **never stop when the user navigates** between pages.
- Tracks should play back-to-back without gaps (live albums, DJ mixes).
- Content is licensed: audio must be protected with DRM.
- A user can control playback on another device (phone, speaker) from the web app, and vice versa.
- Tens of millions of daily users; playlists can contain 10,000+ tracks.

Focus on the app architecture, the playback engine, the queue model, data fetching and caching, multi-device sync
and performance.
