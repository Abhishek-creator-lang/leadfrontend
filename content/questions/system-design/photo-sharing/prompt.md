Design the web client of a **photo sharing application** like Instagram.

Core screens:

- **Home feed** of photos (and multi-photo carousels) from accounts the user follows, with likes, comments and
  captions.
- **Profile page** with a grid of a user's posts, follower counts and a follow button.
- **Post detail** view (opened as a modal over the feed or grid, with its own shareable URL).
- **Create post**: pick one or more photos, crop and apply a filter, write a caption, and publish.

Constraints from the interviewer:

- Most traffic is mobile web on mid-range devices; images are the bulk of every page's bytes.
- Profile pages are public and must be indexable by search engines and render well when shared on other sites.
- Uploads can be 12 MP phone photos (4–8 MB each) on unreliable connections.

Focus on the client: image delivery and loading strategy, upload pipeline, data model, API and UX details.
