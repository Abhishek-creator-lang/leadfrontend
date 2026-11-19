Design a reusable **image uploader component** for a design system. It is used for profile pictures, product photo
galleries on a marketplace listing form, and attaching images to messages.

Requirements:

- Select files via a button, drag and drop, or paste from the clipboard.
- Show thumbnails immediately, per-file progress, and allow cancel, retry, remove and reorder.
- Validate type, size and dimensions; optionally crop (avatars).
- Uploads should be fast on mobile networks and survive flaky connections; photos from phones are often 5–15 MB.
- The surrounding form can be submitted only when uploads are complete.

Discuss the component API, the upload pipeline (including client-side processing and how files reach storage), state
management, error handling, accessibility and security.
